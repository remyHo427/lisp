import { Lexer } from "./lex";
import { Node, Terminal, Token, Nodetype, Toktype, Panic } from "./types";

export class Parser {
    private readonly lexer: Lexer;

    constructor () {
        this.lexer = new Lexer();
    }

    public parse(str: string): Node {
        this.lexer.init(str);
    
        const n = this.program();
        this.expect(Toktype.EOF);
        return n;
    }
    
    private program() {
        const forms: Node[] = [];
    
        for (let f: Node | null; f = this.form(true); ) {
            forms.push(f);
        }
    
        return new Node(Nodetype.PROGRAM, ...forms);
    }
    private form(repeat = false): Node | null {
        try {
            const tok = this.lexer.gettok();
            switch (tok.type) {
                case Toktype.BOOLEAN:
                case Toktype.NUMBER:
                case Toktype.IDENT:
                case Toktype.STRING:
                case Toktype.CHARACTER:
                case Toktype.QUOT:
                    this.lexer.ungettok(tok);
                    return this.expression() as Node;
                case Toktype.LPAREN: {
                    const ntok = this.lexer.gettok();
                    switch (ntok.type) {
                        case Toktype.DEFINE:
                            this.lexer.ungettok(ntok, tok);
                            return this.variable_definition();
                        case Toktype.IF:
                        case Toktype.LAMBDA:
                        default:
                            this.lexer.ungettok(ntok, tok);
                            return this.expression() as Node;
                    }
                }
                default:
                    if (tok.type === Toktype.EOF) {
                        return null;
                    } else if (repeat) {
                        this.lexer.ungettok(tok);
                        return null;
                    } else {
                        throw new Error("parsing error at form()");
                    }
            }
        } catch (e) {
            if (e instanceof Panic) {
                const { col, line } = e.offendingToken;
                console.error(`PARSING ERROR: ${e.message} (${line}:${col})`);
                this.sync();
                return this.form();
            } else {
                throw e;
            }
        }
    }
    private variable_definition() {
        this.expect(Toktype.LPAREN);
        this.expect(Toktype.DEFINE);
        const id = this.expect(Toktype.IDENT);
        const expr = this.expression() as Node;
        this.expect(Toktype.RPAREN);
    
        return new Node(Nodetype.VAR_DEF, new Terminal(id), expr);
    }
    private expression(repeat = false) {
        const tok = this.lexer.gettok();
        switch (tok.type) {
            case Toktype.BOOLEAN:
            case Toktype.NUMBER:
            case Toktype.IDENT:
            case Toktype.STRING:
            case Toktype.CHARACTER:
                this.lexer.ungettok(tok);
                return this.constant();
            case Toktype.QUOT:
                this.lexer.ungettok(tok);
                return this.quoted();
            case Toktype.LPAREN: {
                const ntok = this.lexer.gettok();
                switch (ntok.type) {
                    case Toktype.LAMBDA:
                        this.lexer.ungettok(ntok, tok);
                        return this.lambda();
                    case Toktype.IF:
                        this.lexer.ungettok(ntok, tok);
                        return this.if_expr();
                    default:
                        this.lexer.ungettok(ntok, tok);
                        return this.application();
                }
            }
            default:
                if (!repeat) throw this.panic(tok);
                else {
                    this.lexer.ungettok(tok);
                    return null;
                }
        }
    }
    private constant(): Node {
        const tok = this.lexer.gettok();
        switch (tok.type) {
            case Toktype.BOOLEAN:
            case Toktype.NUMBER:
            case Toktype.IDENT:
            case Toktype.CHARACTER:
            case Toktype.STRING:
                return new Terminal(tok);
            default:
                throw this.panic(tok);
        }
    }
    private application(): Node {
        this.expect(Toktype.LPAREN);
        const head = this.expression() as Node;
        const elems: Node[] = [];
        for (let e: Node | null; e = this.expression(true); ) {
            elems.push(e);
        }
        this.expect(Toktype.RPAREN);
    
        return new Node(Nodetype.APPLI, head, ...elems);
    }
    private quoted(): Node {
        this.expect(Toktype.QUOT);
        const d = this.datum() as Node;
    
        return new Node(Nodetype.QUOTED, d);
    }
    private lambda(): Node {
        this.expect(Toktype.LPAREN);
        this.expect(Toktype.LAMBDA);
        const f = this.formals();
        const b = this.body();
        this.expect(Toktype.RPAREN);
    
        return new Node(Nodetype.LAMBDA, f, b);
    }
    private if_expr(): Node {
        this.expect(Toktype.LPAREN);
        this.expect(Toktype.IF);
        const p = this.expression(false) as Node;
        const t = this.expression(false) as Node;        
        const f = this.expression(false) as Node;
        this.expect(Toktype.RPAREN);
        return new Node(Nodetype.IF, p, t, f);
    }
    private body() {
        const first = this.expression() as Node;
        const exprs: Node[] = [];
        for (let e: Node | null; e = this.expression(true); ) {
            exprs.push(e);
        }
        return new Node(Nodetype.BODY, first, ...exprs);
    }
    private formals(): Node {
        this.expect(Toktype.LPAREN);
        const vars: Node[] = [];
    
        for (let tok: Token | null; tok = this.match(Toktype.IDENT); ) {
            vars.push(new Terminal(tok));
        }
    
        this.expect(Toktype.RPAREN);
        return new Node(Nodetype.FORMALS, ...vars);
    }
    private list(): Node {
        this.expect(Toktype.LPAREN);
        const data: Node[] = [];
    
        for (let d: Node | null; d = this.datum(true); ) {
            data.push(d);
        }
        this.expect(Toktype.RPAREN);
    
        return new Node(Nodetype.LIST, ...data);
    }
    private datum(repeat = false): Node | null {
        const tok = this.lexer.gettok();
        switch (tok.type) {
            case Toktype.BOOLEAN:
            case Toktype.NUMBER:
            case Toktype.IDENT:
                return new Node(Nodetype.DATUM, new Terminal(tok));
            case Toktype.LPAREN: {
                this. lexer.ungettok(tok);
                const l = this.list();
                return l;
            }
            default:
                if (!repeat) throw this.panic(tok);
                else {
                    this.lexer.ungettok(tok);
                    return null;
                }
        }
    }

    private sync() {
        let tok = this.lexer.gettok();
        while (tok.type !== Toktype.RPAREN && tok.type !== Toktype.EOF) {
            tok = this.lexer.gettok();
        }
    }
    private panic(tok: Token) {
        this.lexer.ungettok(tok);
        throw new Panic(`unexpected ${Toktype[tok.type]}`, tok);
    }
    private expect(expected: Toktype) {
        const tok = this.lexer.gettok();
        if (tok.type === expected) {
            return tok;
        } else {
            this.lexer.ungettok(tok);
            throw new Panic(`expected ${Toktype[expected]}, got ${Toktype[tok.type]}`, tok);
        }
    }
    private match(expected: Toktype) {
        const tok = this.lexer.gettok();
        if (tok.type === expected) {
            return tok;
        } else {
            this.lexer.ungettok(tok);
            return null;
        }
    }
}