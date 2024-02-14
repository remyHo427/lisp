import { Node, Terminal, node_type, Toktype } from "./types";
import { init_global, Env } from "./env";

export function evaluate_program(node: Node) {
    const global = init_global();

    for (const form of node.children) {
        eval_form(form, global);
    }
}
export function init_repl() {
    const global = init_global();
    
    return (node: Node) => {
        for (const form of node.children) {
            eval_form(form, global);
        }
    }
}

function eval_form(form: Node, env: Env) {
    if (form.type === node_type.VAR_DEF) {
        return eval_vardef(form, env);
    } else {
        return eval_expr(form, env);
    }
}

function eval_vardef(vardef: Node, env: Env) {
    const [ id, expr ] = vardef.children;
    env.set((id as Terminal).token.sval, eval_expr(expr, env));
    return null;
}

function eval_expr(expr: Node, env: Env) {
    switch (expr.type) {
        case node_type.TOKEN:
            return eval_tok(expr as Terminal, env);
        case node_type.APPLI:
            return eval_apply(expr, env);
        case node_type.IF:
            return eval_if(expr, env);
        case node_type.LAMBDA:
            return eval_lambda(expr, env);
    }
}
function eval_tok(tok: Terminal, env: Env) {
    switch (tok.token.type) {
        case Toktype.BOOLEAN:
            return tok.token.bval;
        case Toktype.NUMBER:
            return tok.token.nval;
        case Toktype.IDENT:
            return env.get(tok.token.sval);
    }
}
function eval_apply(expr: Node, env: Env) {
    const [ head, ...elems ] = expr.children;
    const hv = eval_expr(head, env);

    if (typeof hv !== "function") {
        throw new Error("eval error in eval_apply()");
    } else {
        return hv(...elems.map((e) => eval_expr(e, env)));
    }
}
function eval_if(expr: Node, env: Env) {
    const [ p, t, f ] = expr.children;
    return eval_expr(p, env) ? eval_expr(t, env) : eval_expr(f, env);
}
function eval_lambda(expr: Node, env: Env) {
    return (...args: any[]) => {
        const [ formals, body ] = expr.children;
        const local = new Env(env);

        for (let i = 0; i < formals.children.length; i++) {
            const formal = (formals.children[i] as Terminal).token.sval;
            const param = args[i];
            local.set(formal, param);
        }
        
        return eval_body(body, local);
    }
}
function eval_body(expr: Node, env: Env) {
    let final: any;

    for (const e of expr.children) {
        final = eval_expr(e, env);
    }

    return final;
}