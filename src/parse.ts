import { init_lex, lex } from "./lex";
import { Node, Terminal, Token, node_type, tok_type } from "./types";

let stack: Token[];

export function parse(str: string): Node {
    init_lex(str);
    stack = [];

    const n = program();
    expect(tok_type.EOF);
    return n;
}

function program() {
    const forms: Node[] = [];

    for (let f: Node | null; f = form(true); ) {
        forms.push(f);
    }

    return new Node(node_type.PROGRAM, ...forms);
}
function form(repeat = false): Node | null {
    const tok = gettok();
    switch (tok.type) {
        case tok_type.BOOLEAN:
        case tok_type.NUMBER:
        case tok_type.IDENT:
        case tok_type.QUOTE:
            ungettok(tok);
            return expression() as Node;
        case tok_type.LPAREN: {
            const ntok = gettok();
            switch (ntok.type) {
                case tok_type.DEFINE:
                    ungettok(ntok, tok);
                    return variable_definition();
                case tok_type.IF:
                case tok_type.LAMBDA:
                default:
                    ungettok(ntok, tok);
                    return expression() as Node;
            }
        }
        default:
            if (!repeat) throw new Error("parsing error at form()");
            else {
                ungettok(tok);
                return null;
            }
    }
}
function variable_definition() {
    expect(tok_type.LPAREN);
    expect(tok_type.DEFINE);
    const id = expect(tok_type.IDENT);
    const expr = expression() as Node;
    expect(tok_type.RPAREN);

    return new Node(node_type.VAR_DEF, new Terminal(id), expr);
}
function expression(repeat = false) {
    const tok = gettok();
    switch (tok.type) {
        case tok_type.BOOLEAN:
        case tok_type.NUMBER:
        case tok_type.IDENT:
            ungettok(tok);
            return constant();
        case tok_type.QUOTE:
            ungettok(tok);
            return quoted();
        case tok_type.LPAREN: {
            const ntok = gettok();
            switch (ntok.type) {
                case tok_type.LAMBDA:
                    ungettok(ntok, tok);
                    return lambda();
                case tok_type.IF:
                    ungettok(ntok, tok);
                    return if_expr();
                default:
                    ungettok(ntok, tok);
                    return application();
            }
        }
        default:
            if (!repeat) throw new Error("parsing error at expression();");
            else {
                ungettok(tok);
                return null;
            }
    }
}
function constant(): Node {
    const tok = gettok();
    switch (tok.type) {
        case tok_type.BOOLEAN:
        case tok_type.NUMBER:
        case tok_type.IDENT:
            return new Terminal(tok);
        default:
            throw new Error("parsing error at constant()");
    }
}
function application(): Node {
    expect(tok_type.LPAREN);
    const head = expression() as Node;
    const elems: Node[] = [];
    for (let e: Node | null; e = expression(true); ) {
        elems.push(e);
    }
    expect(tok_type.RPAREN);

    return new Node(node_type.APPLI, head, ...elems);
}
function quoted(): Node {
    expect(tok_type.QUOTE);
    const d = datum() as Node;

    return new Node(node_type.QUOTED, d);
}
function lambda(): Node {
    expect(tok_type.LPAREN);
    expect(tok_type.LAMBDA);
    const f = formals();
    const b = body();
    expect(tok_type.RPAREN);

    return new Node(node_type.LAMBDA, f, b);
}
function if_expr(): Node {
    expect(tok_type.LPAREN);
    expect(tok_type.IF);
    const p = expression(false) as Node;
    const t = expression(false) as Node;        
    const f = expression(false) as Node;
    expect(tok_type.RPAREN);
    return new Node(node_type.IF, p, t, f);
}
function body() {
    const first = expression() as Node;
    const exprs: Node[] = [];
    for (let e: Node | null; e = expression(true); ) {
        exprs.push(e);
    }
    return new Node(node_type.BODY, first, ...exprs);
}
function formals(): Node {
    expect(tok_type.LPAREN);
    const vars: Node[] = [];

    for (let tok: Token | null; tok = match(tok_type.IDENT); ) {
        vars.push(new Terminal(tok));
    }

    expect(tok_type.RPAREN);
    return new Node(node_type.FORMALS, ...vars);
}
function list(): Node {
    expect(tok_type.LPAREN);
    const data: Node[] = [];

    for (let d: Node | null; d = datum(true); ) {
        data.push(d);
    }
    expect(tok_type.RPAREN);

    return new Node(node_type.LIST, ...data);
}
function datum(repeat = false): Node | null {
    const tok = gettok();
    switch (tok.type) {
        case tok_type.BOOLEAN:
        case tok_type.NUMBER:
            return new Node(node_type.DATUM, new Terminal(tok));
        case tok_type.LPAREN: {
            ungettok(tok);
            const l = list();
            return l;
        }
        default:
            if (!repeat) throw new Error("parse error at datum()");
            else {
                ungettok(tok);
                return null;
            }
    }
}

function expect(expected: tok_type, possible_eof = false) {
    const tok = gettok();
    if (tok.type === expected) {
        return tok;
    } else if (possible_eof && tok.type === tok_type.EOF) {
        ungettok(tok);
        return tok;
    } else {
        throw new Error(`parse error: expected ${tok_type[expected]}, got ${tok_type[tok.type]}`)
    }
}
function match(expected: tok_type) {
    const tok = gettok();
    if (tok.type === expected) {
        return tok;
    } else {
        ungettok(tok);
        return null;
    }
}
function gettok() {
    return stack.pop() || lex();
}
function ungettok(...toks: Token[]) {
    for (const t of toks) {
        stack.push(t);
    }
}