# PO File Translation Tool for ChatGPT

![NPM Version](https://img.shields.io/npm/v/%40sitamet%2Fgptpo)
    ![NPM Downloads](https://img.shields.io/npm/dm/%40sitamet%2Fgptpo)

Translation command line tool for gettext (po) files that supports pre-translation and chat-gpt translations with assitant and fine tunning of models. 

Features:
- preprocess a po file based on previous translated po files.
- fine-tune an open-ai model to get more accurate translations.
- translate a specified po file to a designated target language using standar and fine-tunned models.
- translate a specified po file with open-ai assistant

**It is recommended to use the paid OpenAI API to improve translation speed, as the free OpenAI API is slower (only 3 translations per minute) and has usage restrictions.**

## 

## Installation

## 1.a Install it for the enduser, as a binary:

```sh
sudo npm install -g @sitamet/gptpo
```

Then your new binary can be called lik 

or

## 1.b Install it as a developer:

```sh
git clone https://github.com/sitamet/gptpo.git
cd gptpo
npm install
```


## 2. Set the environment vars  

Set the env var `OPENAI_API_KEY` before using this tool.

```sh
export OPENAI_API_KEY=sk-F***********************************vGL

# optional: you can set a default open ai model
export OPENAI_API_MODEL=gpt-3.5-turbo-1106
```

in Windows PowerShell

```shell
set "OPENAI_API_KEY=sk-F***********************************vGL"
set "OPENAI_API_MODEL=gpt-3.5-turbo-1106"
```


## Usage Scenarios

### Show help:

```shell
gptpo --help

# or if you are in a development environment:
npm run start -- --help
or
node index.js --help
```

### Preprocess to incorporate translations from previous po files:

```shell
gptpo preprocess --help

Usage: gptpo preprocess [options]

update po from previous translated po files (origin po will incorporate translations from previous po files)

Options:
  -f, --force    Overide origin translations
  --po <file>    po file path
  --prev <file>  po file (or dir) where previous po file(s) are placed (default: "./previous")
  -h, --help     display help for command
```

#### preprocess demo:

```shell
cd demo
gptpo preprocess --po test.po --prev ./previous
```


### Translate a po file using completions with a fine-tuned model


IMPORTANT: Before translating with GPT, we need to establish a system prompt. This prompt will be reused for every translation task.

PROBLEM 1: It is crucial to use brief prompts to reduce the token costs associated with each API request.
SOLUTION: The strategy involves "fine-tuning" a model to function as a translator, training it to respond efficiently to succinct prompts.

PROBLEM 2: Standard GPT models do not specifically cater to our "language-domain," such as WordPress plugin translations.
SOLUTION: We will employ the gpt fine-tuning process to tell to the model all this translation details.

#### Create the system prompt.

In your working directory, save the system prompt text in a file named `systemprompt.txt`.

```shell
cd demo
echo 'You are a machine translating English to Catalan text.' > systemprompt.txt
```

In this next section we will fine-tune a model to asume this role.

#### Preparing your dataset to tune the model

In the previous section we defined the prompt to use for our system. Now it's time to train the assistant to respond to our users' requests following our language requirements.

The file format is jsonl each message line with an array of 3 objects:

```shell
{"messages": [{"role": "system", "content": "You are a machine translating English to Catalan text."}, 
              {"role": "user", "content": "checkbox."}, 
              {"role": "assistant", "content": "casella de selecció."}]}
```

Example:
```
cat fine-tuning-ca.jsonl
{"messages": [{"role": "system", "content": "You are a machine translating English to Catalan text."}, {"role": "user", "content": "checkbox."}, {"role": "assistant", "content": "casella de selecció."}]}
{"messages": [{"role": "system", "content": "You are a machine translating English to Catalan text."}, {"role": "user", "content": "This plugin is compatible with your PHP version"}, {"role": "assistant", "content": "Aquesta extensió és compatible amb la versió de PHP"}]}
{"messages": [{"role": "system", "content": "You are a machine translating English to Catalan text."}, {"role": "user", "content": "Accessed a banned URL"}, {"role": "assistant", "content": "S'ha accedit a un URL prohibit"}]}
{"messages": ...
```

To fine-tune a model, you are required to provide at least 10 examples. We typically see clear improvements from fine-tuning on 50 to 100 training examples with gpt-3.5-turbo but the right number varies greatly based on the exact use case.

Get detailed info in opanai guides: https://platform.openai.com/docs/guides/fine-tuning/preparing-your-dataset


#### Start a job to fine tune a model

```shell
cd demo

### Fine tune your gpt model:

```shell
gptpo fine-tuning --help


Usage: gptpo fine-tuning [options]

launch a new fine-tune task to customize your OpenAI model

Options:
  -k, --key <key>    openai api key (env: OPENAI_API_KEY)
  --model <model>    openai model to use as starting point or your previous fine-tuned model (default: "gpt-3.5-turbo-1106", env: OPENAI_API_MODEL)
  --suffix <suffix>  fine tunned model suffix
  --file <file>      jsonl file path to the fine-tuning messages
  -h, --help         display help for command
```

NOTE: The optimal balance of cost and results is achieved by starting with the model gpt-3.5-turbo-1106 

#### fine-tuning demo:

lets fine tune our starting model `OPENAI_API_MODEL=gpt-3.5-turbo-1106`

```shell
cd demo
gptpo fine-tuning --suffix cat01 --file ./fine-tuning-ca.jsonl
```


### List your fine tuned models:

```shell
gptpo fine-tuning-jobs --help


list fine-tune jobs

Options:
  -k, --key <key>     openai api key (env: OPENAI_API_KEY)
  -l --limit <limit>  max items listed (default: 10)
  -h, --help          display help for command
```

#### fine-tuning-jobs demo:


```shell
gptpo fine-tuning-jobs

[
   {
    object: 'fine_tuning.job',
    id: 'ftjob-2u8sMZaK82tKXpmIr9Rt1iXM',
    model: 'gpt-3.5-turbo-1106',
    created_at: 1704570847,
    finished_at: 1704571377,
    fine_tuned_model: 'ft:gpt-3.5-turbo-1106:wetopi:cat01:8e7AgzNb',
    organization_id: 'org-iMMKhtTcRklst7guwU9LzPr6',
    result_files: [ 'file-bg27iX6hYBIN2rCtDlkkZon6' ],
    status: 'succeeded',
    validation_file: null,
    training_file: 'file-7vDQosGoZ48fni1ekm0TBJE3',
    hyperparameters: { n_epochs: 3, batch_size: 1, learning_rate_multiplier: 2 },
    trained_tokens: 12555,
    error: null
  }
]
```

You can identify your fine tuned model in the json attribute: `fine_tuned_model`:

### Translate po file using our last fine tuned model:

Now we set the environment var `OPENAI_API_MODEL` to point to our new trained model:

```shell
export OPENAI_API_MODEL=ft:gpt-3.5-turbo-1106:wetopi:cat01:8e7AgzNb
```


```shell
gptpo translate --help

Usage: gptpo translate [options]

translate po file with completions (default command)

Options:
  -k, --key <key>      openai api key (env: OPENAI_API_KEY)
  --model <model>      openai model (default: "gpt-3.5-turbo-1106", env: OPENAI_API_MODEL)
  --po <file>          po file path
  --dir <dir>          po file directory
  --verbose            print verbose log
  -o, --output <file>  output file path, overwirte po file by default
  -h, --help           display help for command
```

#### Translating our demo file test.po

```shell
cd demo
gptpo translate --po ./test.po --verbose

(node:58702) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
░░░░░░░░░░░░░░░░░░░░ 0% 0/1 
==> Someone tried to recover the password for user with email address: %s
==> Algú ha intentat recuperar la contrasenya de l'usuari amb l'adreça de correu electrònic: %s
████████████████████ 100% 1/1 done.
```

## Acknowledgments
This project has been greatly inspired by the pioneering work done by ryanhex53 with https://github.com/ryanhex53/gpt-po
The foundational ideas and codebase provided by ryanhex53 gpt-po have been instrumental in shaping the direction and development of this project.


