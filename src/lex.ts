import { isalnum, isalpha, isdigit, isspace } from "./ctype";
import { Token, Toktype } from "./types";

export class Lexer {
    private readonly stack: Token[];
    private readonly keywords: Map<string, Toktype>;
    private src: string;
    private sp: number;

    constructor () {
        this.stack = [];
        this.keywords = new Map();
        this.keywords.set("begin", Toktype.BEGIN);
        this.keywords.set("let-syntax", Toktype.LET_SYNTAX);
        this.keywords.set("letrec-syntax", Toktype.LETRECT_SYNTAX);
        this.keywords.set("define", Toktype.DEFINE);
        this.keywords.set("define-syntaax", Toktype.DEFINE_SYNTAX);
        this.keywords.set("quote", Toktype.QUOTE);
        this.keywords.set("lambda", Toktype.LAMBDA);
        this.keywords.set("if", Toktype.IF);
        this.keywords.set("set!", Toktype.SET);
    }
    public init(str: string) {
        this.src = str;
        this.sp = 0;
    }
    public lex() {
        while (!this.isend()) {
            const c = this.peek();

            if (isspace(c)) {
                this.adv();
                continue;
            } else if (isdigit(c)) {
                return this.number();
            } else {
                switch (c) {
                    case ";":
                        do {
                            this.adv();
                        } while (this.peek() === '\n');
                        continue;
                    case "(":
                        this.adv();
                        return new Token(Toktype.LPAREN);
                    case ")":
                        this.adv();
                        return new Token(Toktype.RPAREN);
                    case "'":
                        this.adv();
                        return new Token(Toktype.QUOT);
                    case '"':
                        this.adv();
                        return this.string();
                    case "#":
                        switch (this.peekn()) {
                            case "(":
                                this.advn(2);
                                return new Token(Toktype.VSTART);
                            case "\\":
                                this.adv();
                                return this.character();
                            case "t":
                                this.advn(2);
                                return new Token(Toktype.BOOLEAN, "", 0, true);
                            case "f":
                                this.advn(2);
                                return new Token(Toktype.BOOLEAN, "", 0, false);
                        }
                    case "+":
                    case "-":
                        this.adv();
                        return new Token(Toktype.IDENT, c);
                    case ".":
                        this.adv();
                        if (this.peek() === "." && this.peekn() === ".") {
                            this.advn(2);
                            return new Token(Toktype.IDENT, "...");
                        } else {
                            throw new Error("lex error: illegal identifier");
                        }
                    default:
                        if (isalpha(c)) {
                            return this.word();
                        } else {
                            throw new Error("lex error: unknown character");
                        }
                }
            }
        }
        return new Token(Toktype.EOF);
    }
    private number() {
        const start = this.getpos();
        do {
            this.adv();
        } while (isdigit(this.peek()));
        const end = this.getpos();
        
        return new Token(
            Toktype.NUMBER, "", 
            Number.parseInt(this.slice(start, end))
        );
    }
    private word() {
        let c: string;
        const start = this.getpos();
        do {
            this.adv();
        } while (isalnum(c = this.peek()));
        const end = this.getpos();
    
        const str = this.slice(start, end);
        const keyword = this.keywords.get(str);
    
        if (keyword) {
            return new Token(keyword);
        } else {
            return new Token(Toktype.IDENT, str);
        }
    }
    private character() {
        if (this.isend()) {
            throw new Error("lex error: empty character constant");
        } else {
            const c = this.peek();
            this.adv();
            return new Token(Toktype.CHARACTER, c);
        }
    }
    private string() {
        const str: string[] = [];

        for (let c: string, nc: string; !this.isend(); ) {
            if ((c = this.peek()) == '\"') {
                this.adv();
                return new Token(Toktype.STRING, str.join(""));
            } else if (c == '\\') {
                if ((nc = this.peekn()) == '\\' || nc == '\"') {
                    str.push(nc);
                    this.advn(2);
                    continue;
                } else {
                    throw new Error("lex error: invalid character escape");
                }
            } else {
                str.push(c);
                this.adv();
            }
        }

        throw new Error("lex error: unterminated string");
    }
    private peek() {
        return this.src.charAt(this.sp);
    }
    private peekn() {
        return this.src.charAt(this.sp + 1);
    }
    private adv() {
        return this.sp++;
    }
    private advn(n: number) {
        return this.sp += n;
    }
    private isend() {
        return this.sp >= this.src.length;
    }
    private slice(start: number, end: number) {
        return this.src.slice(start, end);
    }
    private getpos() {
        return this.sp;
    }
    public gettok() {
        return this.stack.pop() || this.lex();
    }
    public ungettok(...toks: Token[]) {
        this.stack.push(...toks);
    }
}