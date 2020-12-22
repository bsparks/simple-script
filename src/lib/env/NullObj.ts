import { EnvObj, EnvObjType } from './obj';

export class NullObj implements EnvObj {
    Type(): EnvObjType {
        return EnvObjType.NULL;
    }

    Inspect(): string {
        return 'null';
    }

    Equals(obj: EnvObj) {
        return obj.Type() === this.Type();
    }
}
