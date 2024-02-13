import { Lexer } from "./lex";
import { Node, Terminal, Token, node_type, tok_type } from "./types";

export class Parser {
    private readonly lexer: Lexer;

    constructor () {
        this.lexer = new Lexer();
    }

    public init(src: string) {
        this.lexer.init(src);
    }
    public parse(str: string): Node {
        this.lexer.init(str);
    
        const n = this.program();
        this.expect(tok_type.EOF);
        return n;
    }
    
    private program() {
        const forms: Node[] = [];
    
        for (let f: Node | null; f = this.form(true); ) {
            forms.push(f);
        }
    
        return new Node(node_type.PROGRAM, ...forms);
    }
    private form(repeat = false): Node | null {
        const tok = this.lexer.gettok();
        switch (tok.type) {
            case tok_type.BOOLEAN:
            case tok_type.NUMBER:
            case tok_type.IDENT:
            case tok_type.QUOTE:
                this.lexer.ungettok(tok);
                return this.expression() as Node;
            case tok_type.LPAREN: {
                const ntok = this.lexer.gettok();
                switch (ntok.type) {
                    case tok_type.DEFINE:
                        this.lexer.ungettok(ntok, tok);
                        return this.variable_definition();
                    case tok_type.IF:
                    case tok_type.LAMBDA:
                    default:
                        this.lexer.ungettok(ntok, tok);
                        return this.expression() as Node;
                }
            }
            default:
                if (!repeat) throw new Error("parsing error at form()");
                else {
                    this.lexer.ungettok(tok);
                    return null;
                }
        }
    }
    private variable_definition() {
        this.expect(tok_type.LPAREN);
        this.expect(tok_type.DEFINE);
        const id = this.expect(tok_type.IDENT);
        const expr = this.expression() as Node;
        this.expect(tok_type.RPAREN);
    
        return new Node(node_type.VAR_DEF, new Terminal(id), expr);
    }
    private expression(repeat = false) {
        const tok = this.lexer.gettok();
        switch (tok.type) {
            case tok_type.BOOLEAN:
            case tok_type.NUMBER:
            case tok_type.IDENT:
                this.lexer.ungettok(tok);
                return this.constant();
            case tok_type.QUOTE:
                this.lexer.ungettok(tok);
                return this.quoted();
            case tok_type.LPAREN: {
                const ntok = this.lexer.gettok();
                switch (ntok.type) {
                    case tok_type.LAMBDA:
                        this.lexer.ungettok(ntok, tok);
                        return this.lambda();
                    case tok_type.IF:
                        this.lexer.ungettok(ntok, tok);
                        return this.if_expr();
                    default:
                        this.lexer.ungettok(ntok, tok);
                        return this.application();
                }
            }
            default:
                if (!repeat) throw new Error("parsing error at expression();");
                else {
                    this.lexer.ungettok(tok);
                    return null;
                }
        }
    }
    private constant(): Node {
        const tok = this.lexer.gettok();
        switch (tok.type) {
            case tok_type.BOOLEAN:
            case tok_type.NUMBER:
            case tok_type.IDENT:
                return new Terminal(tok);
            default:
                throw new Error("parsing error at constant()");
        }
    }
    private application(): Node {
        this.expect(tok_type.LPAREN);
        const head = this.expression() as Node;
        const elems: Node[] = [];
        for (let e: Node | null; e = this.expression(true); ) {
            elems.push(e);
        }
        this.expect(tok_type.RPAREN);
    
        return new Node(node_type.APPLI, head, ...elems);
    }
    private quoted(): Node {
        this.expect(tok_type.QUOTE);
        const d = this.datum() as Node;
    
        return new Node(node_type.QUOTED, d);
    }
    private lambda(): Node {
        this.expect(tok_type.LPAREN);
        this.expect(tok_type.LAMBDA);
        const f = this.formals();
        const b = this.body();
        this.expect(tok_type.RPAREN);
    
        return new Node(node_type.LAMBDA, f, b);
    }
    private if_expr(): Node {
        this.expect(tok_type.LPAREN);
        this.expect(tok_type.IF);
        const p = this.expression(false) as Node;
        const t = this.expression(false) as Node;        
        const f = this.expression(false) as Node;
        this.expect(tok_type.RPAREN);
        return new Node(node_type.IF, p, t, f);
    }
    private body() {
        const first = this.expression() as Node;
        const exprs: Node[] = [];
        for (let e: Node | null; e = this.expression(true); ) {
            exprs.push(e);
        }
        return new Node(node_type.BODY, first, ...exprs);
    }
    private formals(): Node {
        this.expect(tok_type.LPAREN);
        const vars: Node[] = [];
    
        for (let tok: Token | null; tok = this.match(tok_type.IDENT); ) {
            vars.push(new Terminal(tok));
        }
    
        this.expect(tok_type.RPAREN);
        return new Node(node_type.FORMALS, ...vars);
    }
    private list(): Node {
        this.expect(tok_type.LPAREN);
        const data: Node[] = [];
    
        for (let d: Node | null; d = this.datum(true); ) {
            data.push(d);
        }
        this.expect(tok_type.RPAREN);
    
        return new Node(node_type.LIST, ...data);
    }
    private datum(repeat = false): Node | null {
        const tok = this.lexer.gettok();
        switch (tok.type) {
            case tok_type.BOOLEAN:
            case tok_type.NUMBER:
                return new Node(node_type.DATUM, new Terminal(tok));
            case tok_type.LPAREN: {
                this. lexer.ungettok(tok);
                const l = this.list();
                return l;
            }
            default:
                if (!repeat) throw new Error("parse error at datum()");
                else {
                    this.lexer.ungettok(tok);
                    return null;
                }
        }
    }

    private expect(expected: tok_type) {
        const tok = this.lexer.gettok();
        if (tok.type === expected) {
            return tok;
        } else {
            throw new Error(`parse error: expected ${tok_type[expected]}, got ${tok_type[tok.type]}`)
        }
    }
    private match(expected: tok_type) {
        const tok = this.lexer.gettok();
        if (tok.type === expected) {
            return tok;
        } else {
            this.lexer.ungettok(tok);
            return null;
        }
    }
}