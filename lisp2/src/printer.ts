import { List } from "./list";
import { Symbol, Value, val_type } from "./types";

export default class Printer {
    public static to_str(value: Value) {
        switch (value.type) {
            case val_type.NIL:
                return "nil";
            case val_type.NUMBER:
            case val_type.BOOLEAN:
            case val_type.CHARACTER:
            case val_type.STRING:
            case val_type.FUNCTION:
                return value.value?.toString() || "";
            case val_type.SYMBOL:
                return (value.value as Symbol).id;
            case val_type.LIST:
                return Printer.list_to_str(value.value as List);
        }
    }
    public static list_to_str(list: List) {
        const buf: string[] = [];
        for (let curr: List | null = list; !List.isNull(curr); curr = curr.next) {
            const v = curr.value as Value;
            const sv = v.type === val_type.LIST 
                ? Printer.list_to_str(v.value as List) 
                : Printer.to_str(v);
 
            buf.push(sv);
        }
       return `(${buf.join(" ")})`;
    }
}