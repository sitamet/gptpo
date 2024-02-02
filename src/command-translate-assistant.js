module.exports = function ({ console, translateAssistantService, TranslatePoService }) {

    const { createThread, translate } = translateAssistantService;
    const { translatePo, translatePoDir } = TranslatePoService({ translate, console })

    return async ({ key, model, po, dir, source, lang, verbose, output, checkRegx }) => {

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

        const thread = await createThread({ model, lang, source });

        if (po) {
            return await translatePo({ lang, po, verbose, output });
        }

        return await translatePoDir({ lang, dir, verbose });
    }
}
