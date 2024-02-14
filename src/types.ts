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
    //
    BOOLEAN,
    NUMBER,
    CHARACTER,
    STRING,
    SYMBOL,
    LIST,
    //
    IDENT
}

export class Token {
    public readonly type: Toktype
    public readonly sval: string;
    public readonly nval: number;
    public readonly bval: boolean;

    constructor (type: Toktype, sval = "", nval = 0, bval = false) {
        this.type = type;
        this.sval = sval;
        this.nval = nval;
        this.bval = bval;
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