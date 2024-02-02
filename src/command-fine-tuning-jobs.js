const OpenAI = require('openai');


module.exports = function ({ }) {

    return async ({ key, limit }) => {

        process.env.OPENAI_API_KEY = key;

        const exitIfNoApiKey = !process.env.OPENAI_API_KEY

        if (exitIfNoApiKey) {
            console.error("OPENAI_API_KEY is required");
            process.exit(1);
        }

        const openai = new OpenAI();

        const page = await openai.fineTuning.jobs.list({ limit });

        console.log(page.data);

    }

}
