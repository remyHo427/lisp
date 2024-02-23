import { Node, Terminal, Nodetype, Toktype, Token, Value, val_type } from "./types";
import { List } from "./list";
import { Env } from "./env";

export default class Evaluator {
    private readonly global: Env;
    private readonly nil: Value;
    constructor () {
        this.global = Env.init_global();
        this.nil = new Value(val_type.NIL, null);
    }

    public evaluate_program(node: Node) {
        for (const form of node.children) {
            this.eval_form(form, this.global);
        }
    }
    public evaluate_form(node: Node): Value {
        return this.eval_form(node, this.global);
    }

    private eval_form(form: Node, env: Env): Value {
        if (form.type === Nodetype.VAR_DEF) {
            return this.eval_vardef(form, env);
        } else {
            return this.eval_expr(form, env);
        }
    }

    private eval_vardef(vardef: Node, env: Env): Value {
        const [ id, expr ] = vardef.children;
        env.set((id as Terminal).token.sval, this.eval_expr(expr, env));
        return this.nil;
    }

    private eval_expr(expr: Node, env: Env): Value {
        switch (expr.type) {
            case Nodetype.TOKEN:
                return this.eval_tok((expr as Terminal).token, env);
            case Nodetype.APPLI:
                return this.eval_apply(expr, env);
            case Nodetype.IF:
                return this.eval_if(expr, env);
            case Nodetype.LAMBDA:
                return this.eval_lambda(expr, env);
            case Nodetype.QUOTED:
                return this.eval_quoted(expr, env);
            default:
                throw new Error("unsupported expression type");
        }
    }
    private eval_tok(tok: Token, env: Env, is_datum = false): Value {
        switch (tok.type) {
            case Toktype.BOOLEAN:
                return new Value(val_type.BOOLEAN, tok.bval);
            case Toktype.NUMBER:
                return new Value(val_type.NUMBER, tok.nval);
            case Toktype.CHARACTER:
                return new Value(val_type.CHARACTER, tok.sval);
            case Toktype.STRING:
                return new Value(val_type.STRING, tok.sval);
            case Toktype.IDENT:
                if (is_datum) {
                    return this.eval_symbol(tok.sval, env);
                } else {
                    const v = env.get(tok.sval);
                    if (v) {
                        return v;
                    } else { 
                        throw new Error(`eval error: ${tok.sval} is undefined`);
                    }
                }
            default:
                throw new Error("eval error: unknown tok type");
        }
    }
    private eval_apply(expr: Node, env: Env) {
        const [ head, ...elems ] = expr.children;
        const hv = this.eval_expr(head, env);

        if (hv.type !== val_type.FUNCTION) {
            throw new Error("eval error: expression not callable");
        } else {
            const args = elems
                .map((e) => this.eval_expr(e, env))
                .map((v) => v.value);
            return (hv.value as Function)(...args);
        }
    }
    private eval_if(expr: Node, env: Env) {
        const [ p, t, f ] = expr.children;
        return this.eval_expr(p, env) 
            ? this.eval_expr(t, env) 
            : this.eval_expr(f, env);
    }
    private eval_lambda(expr: Node, env: Env) {
        const fn = (...args: any[]) => {
            const [ formals, body ] = expr.children;
            const local = new Env(env);

            for (let i = 0; i < formals.children.length; i++) {
                const formal = (formals.children[i] as Terminal).token.sval;
                const param = args[i];
                local.set(formal, param);
            }
            
            return this.eval_body(body, local);
        }
        return new Value(val_type.FUNCTION, fn);
    }
    private eval_body(expr: Node, env: Env) {
        let final: any;

        for (const e of expr.children) {
            final = this.eval_expr(e, env);
        }

        return final;
    }
    private eval_quoted(expr: Node, env: Env) {
        const quoted = expr.children[0];
        switch (quoted.type) {
            case Nodetype.DATUM:
                return this.eval_datum(quoted, env);
            case Nodetype.LIST:
                return this.eval_list(quoted, env);
            default:
                throw new Error("eval error: unknown quoted expression type");
        }
    }
    private eval_list(list: Node, env: Env): Value {
        if (!list.children.length) {
            return new Value(val_type.LIST, List.getNull());
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

        return new Value(val_type.LIST, head);
    }
    private eval_datum(datum: Node, env: Env) {
        const tok = (datum.children[0] as Terminal).token;
        return this.eval_tok(tok, env, true);
    }
    private eval_symbol(id: string, env: Env): Value {
        return env.symget(id) || env.symset(id);
    }
}