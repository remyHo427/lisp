import process from "node:process";
import { Interface } from "node:readline";

export default class REPL {
    private readonly rl: Interface;

    constructor (rl: Interface) { 
        this.rl = rl;
    }

    public async repl(fn: (string) => string) {
        let buf: string[] = [];
        let count = 0;

        process.stdout.write("> ");
        for await (const l of this.rl) {
            count = this.count_paren(l, count);

            if (count > 0) {
                process.stdout.write(`${count}?`);
                for (let i = 0; i < count; i++) {
                    process.stdout.write("  ");
                }
                buf.push(l);
            } else {
                buf.push(l);
                console.log(fn(buf.join("")));
                buf = [];
                count = 0;
                process.stdout.write("> ");
            }
        }
    }

    private count_paren(line: string, startAt = 0): number {
        let level = startAt;
        let sp = 0;

        while (sp < line.length) {
            const c = line.charAt(sp++);
            if (c == "(") level++;
            else if (c == ")") level--;
        }
        
        return level;
    }
}