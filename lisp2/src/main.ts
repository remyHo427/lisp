import process from "node:process";
import { createInterface } from "node:readline";
import REPL from "./repl";
import Parser from "./parse";
import Evaluator from "./eval";

(async function () {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false, 
    });
    const repl = new REPL(rl);
    const parser = new Parser();
    const evaluator = new Evaluator();

    repl.repl((line) => {
        evaluator.evaluate_form(parser.parse_form(line));
        return "ok";
    });
})();