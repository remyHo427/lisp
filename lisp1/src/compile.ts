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
            case Nodetype.APPLI:
                return this.compile_application(expr);
            default:
                throw Error("compile error at compile_expr()");
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
            case Toktype.IDENT:
                return tok.sval;
            default:
                throw Error("compile error at compile_tok()");
        }
    }
    private compile_if(expr: Node): string {
        const [ p, t, f ] = expr.children;
        const cp = this.compile_expr(p);
        const ct = this.compile_expr(t);
        const cf = this.compile_expr(f);
        return `(${cp} ? ${ct} : ${cf})`
    }
    private compile_lambda(expr: Node): string {
        const [ f, b ] = expr.children;
        return `(function(${this.compile_formals(f)}){${this.compile_body(b)}})`
    }
    private compile_formals(expr: Node): string {
        return (expr.children as Terminal[])
            .map(t => t.token.sval)
            .join(",");
    }
    private compile_body(expr: Node): string {
        return expr.children
            .map(e => this.compile_expr(e))
            .join("");
    }
    private compile_application(expr: Node): string {
        const [ head, ...exprs ] = expr.children;
        return `(${this.compile_expr(head)}(${exprs.map(e => this.compile_expr(e)).join(",")}))`;
    }
}