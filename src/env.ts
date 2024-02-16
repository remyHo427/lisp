import { List } from "./list";

export class Env {
    private readonly parent: Env | null;
    private readonly vars: Map<string, any>;

    constructor (parent?: Env) {
        this.parent = parent || null;
        this.vars = new Map(parent ? parent.getAll() : undefined);
    }

    public set(k: string, v: any) {
        this.vars.set(k, v);
    }
    public get(k: string) {
        return this.vars.get(k);
    }
    public getAll() {
        return this.vars;
    }
    public lookup(k: string) {
        for (let env: Env | null = this; env; env = this.parent) {
            const v = env.get(k);
            if (v) {
                return v;
            }
        }
        return null;
    }
}
export function init_global(): Env {
    const global = new Env();

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
    global.set("car", arity(1, List.car));
    global.set("cdr", arity(1, List.cdr));
    global.set("null?", arity(1, List.isNull));
    global.set("p", console.log);
    
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