module.exports = function ({ compilePo, parsePo, checkPathType, isPoFile, getFilePathsInDirectory, console }) {

    let itemsTranslated = 0;

    return async function commandPreprocess({ po, prev, force }) {

        try {

            console.log(`Preprocessing PO file: ${po}`);

            const targetTranslations = await parsePo(po);

            const poFiles = await getPoFiles(prev)

            if (!poFiles?.length) {
                console.log('· Preprocessed 0 files');
                return;
            };

            for (const poFile of poFiles) {
                try {
                    await preprocessThisPo({ force, poFile, targetTranslations });
                } catch (error) {
                    console.error('· An error occurred preprocessing file:', poFile, error);
                }
            }

            await compilePo(targetTranslations, po);

            console.log(`· Preprocessed ${poFiles?.length} files, translated ${itemsTranslated} messages.`)

        } catch (error) {
            console.error('· An error occurred preprocessing:', error);
        }
    }


    async function preprocessThisPo({ force, poFile, targetTranslations }) {

        console.log(`· Get translations from: ${poFile}`);

        const previousTranslations = await parsePo(poFile);

        Object.entries(previousTranslations.translations).forEach(([context, entries]) => {

            Object.entries(entries).forEach(([msgid, data]) => {

                // TODO: translate also msgid_plural

                if (data.msgid === '') return
                if (data.msgstr[0] === '') return


                const targetTranlsationData = targetTranslations.translations[context]?.[msgid];

                if (!targetTranlsationData) return

                const targetTranlsationEmpty = !Boolean(targetTranlsationData?.msgstr[0]);

                if (!targetTranlsationEmpty && !force) return;


                targetTranslations.translations[context][msgid] = data;

                itemsTranslated++;
            });
        });

    }


    async function getPoFiles(prev) {

        let poFiles = [prev];

        const potType = await checkPathType(prev);

        if (potType == 'directory') {
            poFiles = await getFilePathsInDirectory(prev)
        }

        return poFiles.filter(file => isPoFile(file))
    }
}
