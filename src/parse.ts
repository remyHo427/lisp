import { init_lex, lex } from "./lex";
import { Node, Terminal, Token, node_type, tok_type } from "./types";

let stack: Token[];

export function parse(str: string) {
    init_lex(str);
    stack = [];

    return program();
}

function program() {
    return form_list();
}
function form_list() {
    const forms: Node[] = [];

    for (let f: Node; f = form(); forms.push(f))
        ;

    return new Node(node_type.FORMS, forms);
}
function form() {
    const tok = gettok();
    switch (tok.type) {
        case tok_type.LPAREN: {
            const tok = gettok();
            if (tok.type === tok_type.DEFINE) {
                return variable_definition();
            } else {
                return expression();
            }
        }
        case tok_type.BOOLEAN:
        case tok_type.NUMBER:
        case tok_type.IDENT:
            return new Terminal(tok);
        default:
            throw new Error("parse error at form()");
    }
}
function variable_definition() {
    return new Node(node_type.VAR_DEF, [ 
        new Terminal(expect(tok_type.IDENT)), 
        expression() 
    ]);
}
function expression(): Node {
    const tok = gettok();
    switch (tok.type) {
        case tok_type.LPAREN: {
            const tok = gettok();
            switch (tok.type) {
                case tok_type.LAMBDA:
                    return lambda();
                case tok_type.IF:
                    return if_expr();
                default:
                    ungettok(tok);
                    return application();
            }
        }
        case tok_type.BOOLEAN:
        case tok_type.NUMBER:
        case tok_type.IDENT:
            return new Terminal(tok);
        default:
            throw new Error("parse error at expression()");
    }
}
function application() {

}
function quoted() {
}
function lambda() {
}
function if_expr() {
}
function formals() {
}
function list() {
}
function datum() {
}
function expect(expected: tok_type) {
    const tok = lex();
    if (tok.type === expected) {
        return tok;
    } else {
        throw new Error(`parse error: expected ${tok_type[expected]}, got ${tok_type[tok.type]}`)
    }
}
function gettok() {
    return stack.pop() || lex();
}
function ungettok(tok: Token) {
    stack.push(tok); 
}