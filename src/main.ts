import fs from "node:fs";
import util from "node:util";
import process from "node:process";
import { createInterface } from "node:readline";
import { Parser } from "./parse";
import { evaluate_program, init_repl } from "./eval";

const argv = process.argv.slice(2);

(async function () {
    const flags = argv.filter((a) => a.startsWith("--"));
    const files = argv.filter((a) => a.endsWith(".ss"));

    if (flags.includes("--repl")) {
        repl();
    } else if (files.length == 1) {
        await run(files[0]);
    }
})();

async function repl() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    const repl_fn = init_repl();
    const parser = new Parser();

    process.stdout.write("> ");
    for await (const l of rl) {
        repl_fn(parser.parse(l));
        process.stdout.write("> ");
    }
}

async function run(file: string) {
    const readfile = util.promisify(fs.readFile);
    const src = await readfile(file, "utf-8");
    const parser = new Parser();

    evaluate_program(parser.parse(src));
}