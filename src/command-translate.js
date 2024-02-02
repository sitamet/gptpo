module.exports = function ({ console, translateChatService, TranslatePoService }) {

    const { init, translate } = translateChatService;
    const { translatePo, translatePoDir } = TranslatePoService({ translate, console })

    return async ({ key, model, po, dir, verbose, output, checkRegx }) => {

        process.env.OPENAI_API_KEY = key;
        process.env.OPENAI_API_MODEL = model;

        const exitIfNoApiKey = !process.env.OPENAI_API_KEY

        if (exitIfNoApiKey) {
            console.error("OPENAI_API_KEY is required");
            process.exit(1);
        }

        if (!po & !dir) {
            console.error("po file or directory is required");
            process.exit(1);
        }

        const thread = await init();

        if (po) {
            return await translatePo({ po, verbose, output });
        }

        return await translatePoDir({ dir, verbose });
    }
}
