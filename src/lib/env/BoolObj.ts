import { EnvObj, EnvObjType } from './obj';

export class BoolObj implements EnvObj {
    constructor(private value: boolean = false) {}

    get Value() {
        return this.value;
    }
    set Value(val: boolean) {
        this.value = val;
    }

    Type(): EnvObjType {
        return EnvObjType.BOOLEAN;
    }

    Inspect(): string {
        return this.Value.toString();
    }

    Equals(obj: EnvObj) {
        if (obj.Type() !== this.Type()) {
            return false;
        }
        return this.value === (obj as BoolObj).Value;
    }
}
