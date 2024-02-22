import { Value } from "./types";

export class List {
    public next: List | null;
    public value: Value | null;
    private readonly sym: Symbol;

    private static readonly NULL = new List(null, null);

    constructor (next: List | null, value: Value | null) {
        this.next = next;
        this.value = value;
        this.sym = Symbol();
    }
    public static isNull(l: List | null) {
        return l?.sym === List.NULL.sym;
    }
    public static getNull() {
        return this.NULL;
    }
    public static car(l: List) {
        if (List.isNull(l)) {
            throw new Error("list error: passed '() to car");
        } else {
            return l.value;
        }
    }
    public static cdr(l: List) {
        if (List.isNull(l)) {
            throw new Error("list error: passed '() to cdr");
        } else {
            return l.next as List
        }
    }
}