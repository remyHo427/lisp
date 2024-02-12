// import fs from "node:fs";
// import util from "node:util";

import process from "node:process";
import { createInterface } from "node:readline";
import { parse } from "./parse";
import { evaluate_program } from "./eval";

// (async function () {
//     const readfile = util.promisify(fs.readFile);
//     const src = await readfile("./src/main.ss", "utf-8");
//     evaluate(parse(src));
// })();

(async function () {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    for await (const l of rl) {
        evaluate_program(parse(l));
    }
})();