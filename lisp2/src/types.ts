import { List } from "./list";

export enum Toktype {
    EOF = 0,
    //
    LPAREN,
    RPAREN,
    QUOT,
    VSTART,     // #(
    //
    BEGIN,
    LET_SYNTAX,
    LETRECT_SYNTAX,
    DEFINE,
    DEFINE_SYNTAX,
    QUOTE,
    LAMBDA,
    IF,
    SET,
    COND,
    LET,
    ELSE,
    //
    BOOLEAN,
    NUMBER,
    CHARACTER,
    STRING,
    //
    IDENT
}

export class Token {
    public readonly type: Toktype
    public readonly sval: string;
    public readonly nval: number;
    public readonly bval: boolean;
    public readonly col: number;
    public readonly line: number;

    constructor (
        type: Toktype, 
        sval: string, 
        nval: number, 
        bval: boolean,
        col: number,
        line: number
    ) {
        this.type = type;
        this.sval = sval;
        this.nval = nval;
        this.bval = bval;
        this.col = col;
        this.line = line;
    }
}
export enum Nodetype {
    TOKEN = 0,
    DATUM,
    LIST,
    FORMALS,
    BODY,
    IF,
    LAMBDA,
    QUOTED,
    APPLI,
    VAR_DEF,
    FORMS,
    PROGRAM
}

export class Node {
    public readonly type: Nodetype;
    public readonly children: Node[];

    constructor (type: Nodetype, ...children: Node[]) {
        this.type = type;
        this.children = children;
    }
}
export class Terminal extends Node {
    public readonly token: Token;

    constructor (token: Token) {
        super(Nodetype.TOKEN);
        this.token = token;
    }
}
export type Env = Map<string, any>;
export class Panic extends Error {
    public readonly offendingToken: Token;
    constructor (message: string, offendingToken: Token) {
        super(message);
        this.offendingToken = offendingToken;
    }
}

export enum val_type {
    NIL = 0,
    NUMBER,
    BOOLEAN,
    CHARACTER,
    STRING,
    SYMBOL,
    LIST,
    FUNCTION
}
export class Symbol {
    public readonly id: string;
    public readonly sym: symbol;
    constructor (id: string, sym: symbol) {
        this.id = id;
        this.sym = sym;
    }
}
type ValueTypes = number | boolean | string | List | Function | Symbol | null;
export class Value {
    public readonly type: val_type;
    public readonly value: ValueTypes;
    constructor (type: val_type, v: ValueTypes) {
        this.type = type;
        this.value = v;
    }
}