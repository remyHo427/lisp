import fs, { writeFile } from "node:fs";
import util from "node:util";
import process from "node:process";
import { createInterface } from "node:readline";
import { Parser } from "./parse";
import { Evaluator } from "./eval";
import { Compiler } from "./compile";

const argv = process.argv.slice(2);

(async function () {
    const flags = argv.filter((a) => a.startsWith("--"));
    const files = argv.filter((a) => a.endsWith(".ss"));

    if (flags.includes("--repl")) {
        repl();
    } else if (flags.includes("--compile")) {
        compile(files[0]);
    } if (files.length == 1) {
        await run(files[0]);
    }
})();

async function repl() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    const evaluator = new Evaluator();
    const parser = new Parser();

    process.stdout.write("> ");
    for await (const l of rl) {
        evaluator.evaluate_program(parser.parse(l));
        process.stdout.write("> ");
    }
}

async function compile(file: string) {
    const readfile = util.promisify(fs.readFile);
    const src = await readfile(file, "utf-8");
    const parser = new Parser();
    const compiler = new Compiler();

    const writefile = util.promisify(fs.writeFile);
    const out = compiler.compile(parser.parse(src));
    await writefile(`${file.slice(0, file.length - 3)}.js`, out);
}

async function run(file: string) {
    const readfile = util.promisify(fs.readFile);
    const src = await readfile(file, "utf-8");
    const parser = new Parser();
    const evaluator = new Evaluator();

    evaluator.evaluate_program(parser.parse(src));
}