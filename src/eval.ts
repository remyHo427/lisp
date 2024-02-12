import { Node, Terminal, node_type, tok_type } from "./types";

type Env = Map<string, any>;

export function evaluate_program(node: Node) {
    const global = init_global();

    for (const form of node.children) {
        eval_form(form, global);
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
        // dunno how to do this part yet
        // case node_type.LAMBDA:
        //     return eval_lambda(expr, env);
    }
}
function eval_tok(tok: Terminal, env: Env) {
    switch (tok.token.type) {
        case tok_type.BOOLEAN:
            return tok.token.bval;
        case tok_type.NUMBER:
            return tok.token.nval;
        case tok_type.IDENT:
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
function make_env(): Env {
    return new Map<string, any>();
}
function init_global() {
    const global = make_env();

    global.set("+", num_only((...a) => a.reduce((a, b) => a + b, 0)));
    global.set("-", num_only((f, ...a) => f - a.reduce((a, b) => a + b, 0)));
    global.set("*", num_only((...a) => a.reduce((a, b) => a * b, 1)));
    global.set("/", num_only((f, ...a) => f / a.reduce((a, b) => a * b, 1)));
    global.set("=", arity(2, num_only((a, b) => a === b)));
    global.set(">=", arity(2, num_only((a, b) => a >= b)));
    global.set("<=", arity(2, num_only((a, b) => a <= b)));
    global.set(">", arity(2, num_only((a, b) => a > b)));
    global.set("<", arity(2, num_only((a, b) => a < b)));
    global.set("and", bool_only((...a) => a.every(c => c === true)));
    global.set("or", bool_only((...a) => a.some(c => c === true)));
    global.set("not", arity(1, bool_only(a => !a)));
    global.set("print", (...a: any[]) => a.forEach(c => console.log(c)));

    return global;
}
function num_only(fn: (...args: number[]) => any) {
    return (...args: unknown[]) => {
        if (args.some(a => typeof a !== "number")) {
            throw new Error("non-number argument encountered");
        } else {
            return fn(...args as number[]);
        }
    }
}
function bool_only(fn: (...args: boolean[]) => any) {
    return (...args: unknown[]) => {
        if (args.some(a => typeof a !== "boolean")) {
            throw new Error("non-boolean argument encountered");
        } else {
            return fn(...args as boolean[]);
        }
    }
}
function arity(n: number, fn: (...args: any[]) => any) {
    return (...args: any[]) => {
        if (args.length != n) {
            throw new Error("arity mismatch");
        } else {
            return fn(...args);
        }
    }
}