const { exec, spawn } = require("node:child_process");
const fs = require("fs").promises;
const { parse: parsePoFile, compile: compilePoFile } = require("gettext-parser").po;
const { homedir, platform } = require("os");
const path = require("path");

module.exports = {
    checkPathType,
    compilePo,
    delaySeconds,
    findConfig,
    getFilePathsInDirectory,
    isPoFile,
    openFileByDefault,
    openFileExplorer,
    parsePo,
    printProgress
}


// Utility function to create a delay
function delaySeconds(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}


function openFileByDefault(filePath) {
    // Use the 'open' command on macOS or 'start' command on Windows to open the file with the default system editor
    const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    // Spawn a new process for the default editor and pass the file name as an argument
    spawn(command, [filePath], { shell: true });
}

async function parsePo(poFile, defaultCharset = "utf-8") {
    try {
        const buffer = await fs.readFile(poFile);
        const result = parsePoFile(buffer, defaultCharset);
        return result;
    } catch (err) {
        throw new Error(`Error parsing PO file: ${err.message}`);
    }
}

async function compilePo(data, poFile) {
    try {
        const buffer = compilePoFile(data, { foldLength: 0 });
        await fs.writeFile(poFile, buffer);
    } catch (error) {
        throw new Error(`Error in compilePo: ${error.message}`);
    }
}

function printProgress(progress, total, extra) {
    const percent = Math.floor((progress / total) * 100);
    const bar = Array(Math.floor(percent / 5))
        .fill("█")
        .join("");
    const dots = Array(20 - Math.floor(percent / 5))
        .fill("░")
        .join("");
    process.stdout.write(`\r${bar}${dots} ${percent}% ${progress}/${total} ${extra || ""}`);
}


/**
 * find config file in the following order:
 * 1. current directory
 * 2. src directory
 * @param fileName
 * @returns full path of the config file
 */
async function findConfig(fileName) {
    const currentDir = process.cwd();
    const srcDir = __dirname;
    const homeDir = homedir();

    const filePaths = [
        path.join(currentDir, fileName),
        path.join(srcDir, fileName),
    ];

    // Check if file exists and return the first one found
    for (const filePath of filePaths) {
        try {
            await fs.access(filePath, fs.constants.F_OK);
            return filePath; // File exists, return the path
        } catch (err) {
            // File doesn't exist, continue to the next path
        }
    }

    // If no file exists, return the default path
    throw new Error(`File not found: ${fileName} (add one in your current dir)`);
}

/**
 * open file explorer by platform
 * @param location folder or file path
 */
function openFileExplorer(location) {

    if (platform() === 'win32') {
        return exec(`explorer.exe "${path.dirname(location)}"`);
    }

    if (platform() === 'darwin') {
        return exec(`open "${path.dirname(location)}"`);
    }

    // Assuming a Linux-based system
    return exec(`xdg-open "${path.dirname(location)}"`);

}


async function checkPathType(path) {
    try {
        const stats = await fs.stat(path);

        if (stats.isFile()) {
            return 'file';
        }

        if (stats.isDirectory()) {
            return 'directory';
        }

        throw new Error('Unknown type');
    } catch (error) {
        throw new Error(`Error checking path: ${error.message}`);
    }
}


async function getFilePathsInDirectory(dir) {
    try {
        const files = await fs.readdir(dir);
        return files.map(file => path.join(dir, file));
    } catch (error) {
        throw new Error(`Error reading directory: ${error.message}`);
    }
}

function isPoFile(filePath) {
    return filePath.endsWith('.po');
}