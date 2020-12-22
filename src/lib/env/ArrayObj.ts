import { EnvObj, EnvObjType } from './obj';

export class ArrayObj implements EnvObj {
    constructor(private elements: EnvObj[] = []) {}

    get Elements() {
        return this.elements;
    }
    set Elements(val) {
        this.elements = val;
    }

    Type(): EnvObjType {
        return EnvObjType.ARRAY;
    }

    Inspect(): string {
        const elements = this.elements.map((p) => p.Inspect()).join(', ');
        return `[${elements}]`;
    }

    Equals(obj: EnvObj) {
        return obj === this;
    }
}
