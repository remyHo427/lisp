import process from "node:process";
import { createInterface } from "node:readline";
import REPL from "./repl";
import Parser from "./parse";
import Evaluator from "./eval";
import Printer from "./printer";

(async function () {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false, 
    });
    const repl = new REPL(rl);
    const parser = new Parser();
    const evaluator = new Evaluator();
    const printer = new Printer();

    repl.repl((line) => {
        const v = evaluator.evaluate_form(parser.parse_form(line));
        return Printer.to_str(v);
    });
})();