import { List } from "./list";
import { Symbol as SymbolValue, Value, val_type } from "./types";

export class Env {
    private readonly parent: Env | null;
    private readonly vars: Map<string, Value>;
    private readonly syms: Map<string, Value>;

    constructor (parent?: Env) {
        this.parent = parent || null;
        this.vars = new Map(parent ? parent.getAll() : undefined);
        this.syms = new Map(parent ? parent.getAllSyms() : undefined);
    }

    public symset(k: string): Value {
        const sym = new Value(val_type.SYMBOL, new SymbolValue(k, Symbol()));
        this.syms.set(k, sym);
        return sym;
    }
    public symget(k: string) {
        return this.syms.get(k);
    }
    public set(k: string, v: Value) {
        this.vars.set(k, v);
    }
    public get(k: string) {
        return this.vars.get(k);
    }
    public getAll() {
        return this.vars;
    }
    public getAllSyms() {
        return this.syms;
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
    public static init_global() {
        const global = new Env();
        const { num_only, arity, bool_only } = Env;

        global.set("+", new Value(val_type.FUNCTION, ((...a) => a.reduce((a, b) => a + b, 0))));
        global.set("-", new Value(val_type.FUNCTION,num_only((f, ...a) => f - a.reduce((a, b) => a + b, 0))));
        global.set("*", new Value(val_type.FUNCTION,num_only((...a) => a.reduce((a, b) => a * b, 1))));
        global.set("/", new Value(val_type.FUNCTION,num_only((f, ...a) => f / a.reduce((a, b) => a * b, 1))));
        global.set("=", new Value(val_type.FUNCTION,arity(2, num_only((a, b) => a === b))));
        global.set(">=", new Value(val_type.FUNCTION,arity(2, num_only((a, b) => a >= b))));
        global.set("<=", new Value(val_type.FUNCTION,arity(2, num_only((a, b) => a <= b))));
        global.set(">", new Value(val_type.FUNCTION,arity(2, num_only((a, b) => a > b))));
        global.set("<", new Value(val_type.FUNCTION,arity(2, num_only((a, b) => a < b))));
        global.set("and", new Value(val_type.FUNCTION,bool_only((...a) => a.every(c => c === true))));
        global.set("or", new Value(val_type.FUNCTION,bool_only((...a) => a.some(c => c === true))));
        global.set("not", new Value(val_type.FUNCTION,arity(1, bool_only(a => !a))));
        global.set("car", new Value(val_type.FUNCTION,arity(1, List.car)));
        global.set("cdr", new Value(val_type.FUNCTION,arity(1, List.cdr)));
        global.set("null?", new Value(val_type.FUNCTION,arity(1, List.isNull)));
        global.set("eq?", new Value(val_type.FUNCTION,arity(2, (a, b) => a === b)));

        return global;
    }
    private static num_only(fn: (...args: number[]) => any) {
        return (...args: unknown[]) => {
            if (args.some(a => typeof a !== "number")) {
                throw new Error("non-number argument encountered");
            } else {
                return fn(...args as number[]);
            }
        }
    }
    private static bool_only(fn: (...args: boolean[]) => any) {
        return (...args: unknown[]) => {
            if (args.some(a => typeof a !== "boolean")) {
                throw new Error("non-boolean argument encountered");
            } else {
                return fn(...args as boolean[]);
            }
        }
    }
    private static arity(n: number, fn: (...args: any[]) => any) {
        return (...args: any[]) => {
            if (args.length != n) {
                throw new Error("arity mismatch");
            } else {
                return fn(...args);
            }
        }
    }
}