const fs = require("fs");
const path = require("path");
const pkg = require("../package.json");
const { compilePo, delaySeconds, findConfig, parsePo, printProgress } = require("./utils.js");

let assistant;
let thread;

module.exports = function ({ translate, console }) {

    return {
        translatePo,
        translatePoDir
    }


    async function translatePo({ po, verbose, output }) {

        const potrans = await parsePo(po);
        const list = [];

        for (const [ctx, entries] of Object.entries(potrans.translations)) {
            for (const [msgid, trans] of Object.entries(entries)) {
                if (msgid == "") continue;
                if (!trans.msgstr[0]) {
                    list.push(trans);
                    continue;
                }
            }
        }

        if (list.length == 0) {
            console.log("done.");
            return;
        }

        potrans.headers["Last-Translator"] = `gpt-po v${pkg.version}`;
        let err429 = false;
        let modified = false;

        for (let i = 0; i < list.length; i++) {
            if (i == 0) printProgress(i, list.length);

            if (err429) {
                await delaySeconds(20);
            }

            const trans = list[i];

            try {
                const message = await translate({ text: trans.msgid });

                trans.msgstr[0] = message;
                modified = true;

                if (verbose) {
                    console.log(`\n==> ${trans.msgid}\n==> ${trans.msgstr[0]}`);
                }

                printProgress(i + 1, list.length);
                await compilePo(potrans, output || po);

            } catch (error) {

                if (error.response) {
                    if (error.response.status == 429) {
                        // caused by rate limit exceeded, should sleep for 20 seconds.
                        err429 = true;
                        --i;
                    } else {
                        console.error(error.response.status);
                        console.log(error.response.data);
                    }
                } else {
                    console.error(error.message);
                    if (error.code == "ECONNABORTED") {
                        console.log('you may need to set "HTTPS_PROXY" to reach openai api.');
                    }
                }
            }
        }

        console.log("done.");
    }


// async function to translate all .po files in a directory
    async function translatePoDir({ model, dir, source, verbose }) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (file.endsWith(".po")) {
                const po = path.join(dir, file);
                console.log(`translating ${po}`);
                await translatePo(model, po, source, verbose, po);
            }
        }
    }

}
