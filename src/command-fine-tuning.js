const fs = require("fs");
const OpenAI = require('openai');


module.exports = function ({ createThread, translatePo, translatePoDir }) {

    return async ({ key, model, suffix, file }) => {

        process.env.OPENAI_API_KEY = key;

        const exitIfNoApiKey = !process.env.OPENAI_API_KEY

        if (exitIfNoApiKey) {
            console.error("OPENAI_API_KEY is required");
            process.exit(1);
        }

        const openai = new OpenAI();

        if (!fs.existsSync(file)) {
            throw new Error(`File not found: ${file}`);
        }

        // If you have access to Node fs we recommend using fs.createReadStream():
        const trainingFile = await openai.files.create({
            file: fs.createReadStream(file),
            purpose: 'fine-tune'
        });

        const fineTune = await openai.fineTuning.jobs.create({
            training_file: trainingFile.id,
            model,
            suffix
        })

        console.log(fineTune);

    }

}
