const fs = require("fs");
const OpenAI = require('openai');
const path = require("path");
const { compilePo, delaySeconds, findConfig, parsePo, printProgress } = require("./utils.js");

let openai;
let assistant;
let thread;

const INSTRUCTIONS_FILE_NAME = 'assistant-instructions.txt';

module.exports = {
    createThread,
    translate
}

async function createThread({ model, source }) {

    openai = new OpenAI();


    const instructions = await getAssistantInstructions();
    const file_ids = await getAssistantFileIds();

    console.log('instructions', instructions);

    assistant = await openai.beta.assistants.create({
        name: "Text Translator",
        model,
        instructions,
        tools: [{ type: "retrieval" }],
        file_ids
    });

    thread = await openai.beta.threads.create();
    return thread;
}


async function getAssistantInstructions() {

    const instructionsFilePath = await findConfig(INSTRUCTIONS_FILE_NAME);

    return await fs.promises.readFile(instructionsFilePath, "utf-8");
}


async function getAssistantFileIds(filePath = 'locale_ca_glossary_converted.txt') {


    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const file = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: "assistants",
    });

    return [file.id]
}

async function translate({ text }) {

    const timeout = 20000;

    const message = await openai.beta.threads.messages.create(thread.id, {
        role: "user", content: `Translate strictly following the guidelines and steps:

    ---${text}---`
    });

    const run = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistant.id });

    await waitForCompletion(thread.id, run.id);

    const messages = await openai.beta.threads.messages.list(thread.id, {
        order: 'desc',
        limit: 1
    });

    const lastMessageValueFromRun = messages?.data[0]?.content[0]?.text?.value;

    return lastMessageValueFromRun;
}


async function waitForCompletion(threadId, runId) {

    let runStatus = await getRunStatus(threadId, runId);

    while (['queued', 'in_progress', 'validating_files'].includes(runStatus)) {

        // console.log(`Status: ${runStatus}. waiting 5 seconds...`);
        await delaySeconds(5);
        runStatus = await getRunStatus(threadId, runId);

    }

    // console.log(`Proceso completado con estado: ${runStatus}`);
    return runStatus;
}


async function getRunStatus(threadId, runId) {
    try {
        // Obtener el estado actual del run
        const response = await openai.beta.threads.runs.retrieve(threadId, runId);

        return response.status;

    } catch (error) {
        console.error('Error al consultar el estado:', error);
        throw error;
    }
}

