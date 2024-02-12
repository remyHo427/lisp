import fs from "node:fs";
import util from "node:util";
import { parse } from "./parse";

(async function () {
    const readfile = util.promisify(fs.readFile);
    const src = await readfile("./src/main.ss", "utf-8");
    console.log(parse(src));
})();