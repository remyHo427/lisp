import { isalnum, isalpha, isdigit, isspace } from "./ctype";
import { Token, tok_type } from "./types";

export class Lexer {
    private readonly stack: Token[];
    private readonly keywords: Map<string, tok_type>;
    private src: string;
    private sp: number;

    constructor () {
        this.stack = [];
        this.keywords = new Map();
        this.keywords.set("if", tok_type.IF);
        this.keywords.set("lambda", tok_type.LAMBDA);
        this.keywords.set("define", tok_type.DEFINE);
        this.keywords.set("cond", tok_type.COND);
        this.keywords.set("else", tok_type.ELSE);
        this.keywords.set("case", tok_type.CASE);        
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
            } else if (isalpha(c)) {
                return this.word();
            } else {
                switch (c) {
                    case ";":
                        this.comment();
                        continue;
                    case "(":
                        this.adv();
                        return new Token(tok_type.LPAREN);
                    case ")":
                        this.adv();
                        return new Token(tok_type.RPAREN);
                    case "'":
                        this.adv();
                        return new Token(tok_type.QUOTE);
                    case "#":
                        return this.bool();
                    default:
                        throw new Error(`unknown character: "${c}"`);
                }
            }
        }

        return new Token(tok_type.EOF);
    }
    private comment() {
        let c: string;
        do {
            this.adv();
        } while ((c = this.peek()) && c != '\n');
    }
    private number() {
        const start = this.getpos();
        do {
            this.adv();
        } while (isdigit(this.peek()));
        const end = this.getpos();
        
        return new Token(
            tok_type.NUMBER, "", 
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
            return new Token(tok_type.IDENT, str);
        }
    }
    private bool() {
        this.adv();
        const c = this.peek();
    
        if (c == 't') {
            this.adv();
            return new Token(tok_type.BOOLEAN, "", 0, true);
        } else if (c == 'f') {
            this.adv();
            return new Token(tok_type.BOOLEAN, "", 0, false);
        } else {
            throw new Error(`lex error: malformed boolean`);
        }
    }
    public peek() {
        return this.src.charAt(this.sp);
    }
    public adv() {
        return this.sp++;
    }
    public isend() {
        return this.sp >= this.src.length;
    }
    public slice(start: number, end: number) {
        return this.src.slice(start, end);
    }
    public getpos() {
        return this.sp;
    }
    public gettok() {
        return this.stack.pop() || this.lex();
    }
    public ungettok(...toks: Token[]) {
        this.stack.push(...toks);
    }
}