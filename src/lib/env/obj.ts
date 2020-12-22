export enum EnvObjType {
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    NULL = 'NULL',
    RETURN_VALUE = 'RETURN_VALUE',
    ERROR = 'ERROR',
    FUNCTION = 'FUNCTION',
    STRING = 'STRING',
    BUILTIN = 'BUILTIN',
    ARRAY = 'ARRAY',
    HASH = 'HASH',
}

export interface EnvObj {
    Type(): EnvObjType;
    Inspect(): string;
    Equals(obj: EnvObj): boolean;
}
