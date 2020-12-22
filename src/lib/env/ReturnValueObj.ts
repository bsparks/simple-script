import { NullObj } from './NullObj';
import { EnvObj, EnvObjType } from './obj';

export class ReturnValueObj implements EnvObj {
    constructor(private value: EnvObj = new NullObj()) {}

    get Value() {
        return this.value;
    }
    set Value(val: EnvObj) {
        this.value = val;
    }

    Type(): EnvObjType {
        return EnvObjType.RETURN_VALUE;
    }

    Inspect(): string {
        return this.Value.Inspect();
    }

    Equals(obj: EnvObj) {
        if (obj.Type() !== this.Type()) {
            return this.Value.Equals(obj);
        }
        return this.Value.Equals((obj as ReturnValueObj).Value);
    }
}
