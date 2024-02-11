import readline from "node:readline";
import { stdin, stdout } from "node:process";
import { init_lex, lex } from "./lex";
import { Token, tok_type } from "./types";
(async function () {
    const rl = readline.createInterface({
        input: stdin,
        output: stdout,
        terminal: false
    });

    for await (const line of rl) {
        init_lex(line);
        for (let tok: Token; (tok = lex()).type != tok_type.EOF; ) {
            console.log(tok_type[tok.type], ":", tok);
        }
    }
})();