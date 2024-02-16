import { Node, Terminal, Nodetype, Toktype } from "./types";
import { List } from "./list";
import { Env } from "./env";

export class Evaluator {
    private readonly global: Env;

    constructor () {
        this.global = Env.init_global();
    }

    public evaluate_program(node: Node) {
        for (const form of node.children) {
            this.eval_form(form, this.global);
        }
    }

    public eval_form(form: Node, env: Env) {
        if (form.type === Nodetype.VAR_DEF) {
            return this.eval_vardef(form, env);
        } else {
            return this.eval_expr(form, env);
        }
    }

    public eval_vardef(vardef: Node, env: Env) {
        const [ id, expr ] = vardef.children;
        env.set((id as Terminal).token.sval, this.eval_expr(expr, env));
        return null;
    }

    public eval_expr(expr: Node, env: Env) {
        switch (expr.type) {
            case Nodetype.TOKEN:
                return this.eval_tok(expr as Terminal, env);
            case Nodetype.APPLI:
                return this.eval_apply(expr, env);
            case Nodetype.IF:
                return this.eval_if(expr, env);
            case Nodetype.LAMBDA:
                return this.eval_lambda(expr, env);
            case Nodetype.QUOTED:
                return this.eval_quoted(expr, env);
            default:
                console.log("unsupported expression type: ", Nodetype[expr.type]);
        }
    }
    public eval_tok(tok: Terminal, env: Env) {
        switch (tok.token.type) {
            case Toktype.BOOLEAN:
                return tok.token.bval;
            case Toktype.NUMBER:
                return tok.token.nval;
            case Toktype.IDENT:
                return env.get(tok.token.sval);
        }
    }
    public eval_apply(expr: Node, env: Env) {
        const [ head, ...elems ] = expr.children;
        const hv = this.eval_expr(head, env);

        if (typeof hv !== "function") {
            throw new Error("eval error in eval_apply()");
        } else {
            return hv(...elems.map((e) => this.eval_expr(e, env)));
        }
    }
    public eval_if(expr: Node, env: Env) {
        const [ p, t, f ] = expr.children;
        return this.eval_expr(p, env) 
            ? this.eval_expr(t, env) 
            : this.eval_expr(f, env);
    }
    public eval_lambda(expr: Node, env: Env) {
        return (...args: any[]) => {
            const [ formals, body ] = expr.children;
            const local = new Env(env);

            for (let i = 0; i < formals.children.length; i++) {
                const formal = (formals.children[i] as Terminal).token.sval;
                const param = args[i];
                local.set(formal, param);
            }
            
            return this.eval_body(body, local);
        }
    }
    public eval_body(expr: Node, env: Env) {
        let final: any;

        for (const e of expr.children) {
            final = this.eval_expr(e, env);
        }

        return final;
    }
    public eval_quoted(expr: Node, env: Env) {
        const quoted = expr.children[0];
        switch (quoted.type) {
            case Nodetype.DATUM:
                return this.eval_datum(quoted, env);
            case Nodetype.LIST:
                return this.eval_list(quoted, env);
        }
    }
    public eval_list(list: Node, env: Env): List {
        if (!list.children.length) {
            return List.getNull();
        }
        
        let curr: List;
        let prev: List;
        let head = new List(null, null);
        prev = curr = head;
        for (const c of list.children) {
            switch (c.type) {
                case Nodetype.LIST:
                    curr.value = this.eval_list(c, env);
                    break;
                case Nodetype.DATUM:
                    curr.value = this.eval_datum(c, env);
                    break;
            }
            curr.next = new List(null, null);
            prev = curr;
            curr = curr.next;
        }
        prev.next = List.getNull();

        return head;
    }
    public eval_datum(datum: Node, env: Env) {
        return this.eval_tok(datum.children[0] as Terminal, env);
    }
}