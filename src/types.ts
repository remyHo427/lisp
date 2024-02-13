export enum tok_type {
    EOF = 0,
    LPAREN,
    RPAREN,
    QUOTE,
    LAMBDA,
    IF,
    DEFINE,
    IDENT,
    BOOLEAN,
    NUMBER
}
export class Token {
    public readonly type: tok_type;
    public readonly sval: string;
    public readonly nval: number;
    public readonly bval: boolean;

    constructor (type: tok_type, sval = "", nval = 0, bval = false) {
        this.type = type;
        this.sval = sval;
        this.nval = nval;
        this.bval = bval;
    }
}

export enum node_type {
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
    public readonly type: node_type;
    public readonly children: Node[];

    constructor (type: node_type, ...children: Node[]) {
        this.type = type;
        this.children = children;
    }
}
export class Terminal extends Node {
    public readonly token: Token;

    constructor (token: Token) {
        super(node_type.TOKEN);
        this.token = token;
    }
}
export type Env = Map<string, any>;