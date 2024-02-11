import { Token, tok_type } from "./types";

const keywords: Map<string, tok_type> = new Map();
keywords.set("if", tok_type.IF);
keywords.set("lambda", tok_type.LAMBDA);
keywords.set("define", tok_type.DEFINE);

let src: string;
let sp: number;

export function init_lex(str: string) {
    src = str;
    sp = 0;
}

export function lex() {
    while (!isend()) {
        const c = peek();
        switch (c) {
            case "\t":
            case "\f":
            case "\r":
            case "\v":
            case "\n":
            case " ":
                adv();
                continue;
            case ";":
                comment();
                continue;
            case "(":
                adv();
                return new Token(tok_type.LPAREN);
            case ")":
                adv();
                return new Token(tok_type.RPAREN);
            case "'":
                adv();
                return new Token(tok_type.QUOTE);
            case "#":
                return bool();
        }
        if (isdigit(c)) {
            return number();
        } else if (isalpha(c)) {
            return word();
        } else {
            throw new Error(`lex error: unknown character: "${c}"`);
        }
    }

    return new Token(tok_type.EOF);
}

function bool() {
    adv();
    const c = peek();

    if (c == 't') {
        adv();
        return new Token(tok_type.BOOLEAN, "", 0, true);
    } else if (c == 'f') {
        adv();
        return new Token(tok_type.BOOLEAN, "", 0, false);
    } else {
        throw new Error(`lex error: malformed boolean`);
    }
}

function comment() {
    let c: string;
    do {
        adv();
    } while ((c = peek()) && c != '\n');
}

function number() {
    const start = getpos();
    do {
        adv();
    } while (isdigit(peek()));
    const end = getpos();
    
    return new Token(tok_type.NUMBER, "", Number.parseInt(slice(start, end)));
}
function word() {
    let c: string;
    const start = getpos();
    do {
        adv();
    } while (isalpha(c = peek()) || isdigit(c));
    const end = getpos();

    const str = slice(start, end);
    const keyword = keywords.get(str);

    if (keyword) {
        return new Token(keyword);
    } else {
        return new Token(tok_type.IDENT, str);
    }
}

function peek() {
    return src.charAt(sp);
}
function adv() {
    sp++;
}
function isend() {
    return sp >= src.length
}
function slice(start: number, end: number) {
    return src.slice(start, end);
}
function getpos() {
    return sp;
}
function isdigit(c: string) {
    return c >= '0' && c <= '9';
}
function isalpha(c: string) {
    if (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z') {
        return true;
    } else {
        switch (c) {
            case "+":
            case "-":
            case "*":
            case "/":
            case "?":
            case ">":
            case "<":
            case "=":
            case "%":
            case "_":
                return true;
            default:
                return false;
        }
    }
}