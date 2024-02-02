#!/usr/bin/env node

const pkg = require("./package.json");
const { checkPathType, compilePo, findConfig, getFilePathsInDirectory, isPoFile, openFileByDefault, openFileExplorer, parsePo } = require("./src/utils.js");
const { Command, Option } = require("commander");
const TranslatePoService = require("./src/translate-po-service.js");


const program = new Command();

program.name(pkg.name).version(pkg.version).description(pkg.description);


const translateChatService = require("./src/translate-chat-service.js");
const commandTranslate = require('./src/command-translate')({ console, translateChatService, TranslatePoService });
program
    .command("translate", { isDefault: true })
    .description("translate po file with completions (default command)")
    .addOption(new Option("-k, --key <key>", "openai api key").env("OPENAI_API_KEY"))
    .addOption(new Option("--model <model>", "openai model").default("gpt-3.5-turbo-1106").env("OPENAI_API_MODEL"))
    .addOption(new Option("--po <file>", "po file path").conflicts("dir"))
    .addOption(new Option("--dir <dir>", "po file directory").conflicts("po"))
    .option("--verbose", "print verbose log")
    .addOption(new Option("-o, --output <file>", "output file path, overwirte po file by default").conflicts("dir"))
    .action(commandTranslate);


const translateAssistantService = require("./src/translate-assistant-service.js");
const commandTranslateAssistant = require('./src/command-translate-assistant')({ console, translateAssistantService, TranslatePoService });
program
    .command("translate-assistant")
    .description("translate po file with assistant")
    .addOption(new Option("-k, --key <key>", "openai api key").env("OPENAI_API_KEY"))
    .addOption(new Option("--model <model>", "openai model").default("gpt-3.5-turbo-1106").env("OPENAI_API_MODEL"))
    .addOption(new Option("--po <file>", "po file path").conflicts("dir"))
    .addOption(new Option("--dir <dir>", "po file directory").conflicts("po"))
    .option("--verbose", "print verbose log")
    .addOption(new Option("-o, --output <file>", "output file path, overwirte po file by default").conflicts("dir"))
    .action(commandTranslateAssistant);



const commandFineTuning = require("./src/command-fine-tuning.js")({ console });
program
    .command("fine-tuning")
    .description("launch a new fine-tune task to customize your OpenAI model")
    .addOption(new Option("-k, --key <key>", "openai api key").env("OPENAI_API_KEY"))
    .addOption(new Option("--model <model>", "openai model to use as starting point or your previous fine-tuned model").default("gpt-3.5-turbo-1106").env("OPENAI_API_MODEL"))
    .requiredOption("--suffix <suffix>", "fine tunned model suffix")
    .requiredOption("--file <file>", "jsonl file path to the fine-tuning messages")
    .action(commandFineTuning);


const commandFineTuningJobs = require("./src/command-fine-tuning-jobs.js")({ console });
program
    .command("fine-tuning-jobs")
    .description("list fine-tune jobs")
    .addOption(new Option("-k, --key <key>", "openai api key").env("OPENAI_API_KEY"))
    .addOption(new Option("-l --limit <limit>", "max items listed").default(10))
    .action(commandFineTuningJobs);



const commandPreprocess = require("./src/command-preprocess.js")({ compilePo, parsePo, checkPathType, isPoFile, getFilePathsInDirectory, console });
program
    .command("preprocess")
    .description("update po from previous translated po files (origin po will incorporate translations from previous po files)")
    .option("-f, --force", "Overide origin translations")
    .requiredOption("--po <file>", "po file path")
    .option("--prev <file>", "po file (or dir) where previous po file(s) are placed", "./previous")
    .action(commandPreprocess);




program.parse(process.argv);
