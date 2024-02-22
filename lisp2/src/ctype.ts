type ctype = (c?: string) => number;

const TB = 0x8;      // TBD
const DD = 0x4;      // decimal digits
const WS = 0x2;      // whitespace
const AL = 0x1;      // alphabetic

const _ctype = [
    TB, TB, TB, TB, TB, TB, TB, TB, TB, WS, 
    WS, WS, WS, WS, TB, TB, TB, TB, TB, TB, 
    TB, TB, TB, TB, TB, TB, TB, TB, TB, TB,
    TB, TB, WS, AL, TB, TB, AL, AL, AL, TB,
    TB, TB, AL, AL, TB, AL, AL, AL, DD, DD,
    DD, DD, DD, DD, DD, DD, DD, DD, AL, TB,
    AL, AL, AL, AL, AL, AL, AL, AL, AL, AL,
    AL, AL, AL, AL, AL, AL, AL, AL, AL, AL,
    AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, 
    AL, TB, TB, TB, AL, AL, TB, AL, AL, AL,
    AL, AL, AL, AL, AL, AL, AL, AL, AL, AL,
    AL, AL, AL, AL, AL, AL, AL, AL, AL, AL,
    AL, AL, AL, TB, TB, TB, AL, TB
] as const;

const isalpha: ctype = (c = "") => _ctype[c.charCodeAt(0)] & AL;
const isdigit: ctype = (c = "") => _ctype[c.charCodeAt(0)] & DD;
const isalnum: ctype = (c = "") => _ctype[c.charCodeAt(0)] & (AL | DD);
const isspace: ctype = (c = "") => _ctype[c.charCodeAt(0)] & WS;

export { isalpha, isdigit, isalnum, isspace }