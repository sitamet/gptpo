const fs = require("fs");
const OpenAI = require('openai');
const path = require("path");
const pkg = require("../package.json");
const { compilePo, delaySeconds, findConfig, parsePo, printProgress } = require("./utils.js");

let openai;
let systemprompt;

module.exports = {
    init,
    translate
}

const SYSTEMPROMPT_FILE_NAME = "systemprompt.txt"

async function init() {

    openai = new OpenAI();

    const systempromptFilePath = await findConfig(SYSTEMPROMPT_FILE_NAME);
    systemprompt = await fs.promises.readFile(systempromptFilePath, "utf-8");

    return openai;
}

async function translate({ text }) {

    const timeout = 20000;

    const payload = {
        model: process.env.OPENAI_API_MODEL,
        temperature: 0,
        messages: [
            { role: "system", content: systemprompt },
            { role: "user", content: text },
        ]
    }

    const result = await openai.chat.completions.create(payload, { timeout });

    return result.choices[0].message?.content;
}
