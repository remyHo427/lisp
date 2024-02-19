import { Node, Nodetype, Terminal, Token, Toktype } from "./types";

export class Compiler {
    constructor () { }
    public compile(node: Node) {
        const code: string[] = [];
        
        for (const form of node.children) {
            code.push(this.compile_form(form));
        }

        return code.join("");
    }
    private compile_form(form: Node): string {
        if (form.type === Nodetype.VAR_DEF) {
            return this.compile_vardef(form);
        } else {
            return this.compile_expr(form);
        }
    }
    private compile_vardef(vardef: Node) {
        const [ tok, expr ] = vardef.children;
        const id = (tok as Terminal).token.sval;
        return `let ${id} = ${this.compile_expr(expr)};`;
    }
    private compile_expr(expr: Node): string {
        switch (expr.type) {
            case Nodetype.TOKEN:
                return this.compile_tok((expr as Terminal).token);
            case Nodetype.IF:
                return this.compile_if(expr);
            case Nodetype.LAMBDA:
                return this.compile_lambda(expr);
            default:
                return "";
        }
    }
    private compile_tok(tok: Token): string {
        switch (tok.type) {
            case Toktype.BOOLEAN:
                return tok.bval.toString();
            case Toktype.NUMBER:
                return tok.nval.toString();
            case Toktype.CHARACTER:
                return `"${tok.sval}"`;
            case Toktype.STRING:
                return `"${tok.sval}"`;
            default:
                return "";
        }
    }
    private compile_if(expr: Node): string {
        const [ p, t, f ] = expr.children;
        const cp = this.compile_expr(p);
        const ct = this.compile_expr(t);
        const cf = this.compile_expr(f);
        return `(${cp} ? ${ct} : ${cf});`
    }
    private compile_lambda(expr: Node): string {
        return "";
    }
}