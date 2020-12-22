import { BlockStatement } from '../ast/BlockStatement';
import { Identifier } from '../ast/Identifier';

import { Environment } from './Environment';
import { EnvObj, EnvObjType } from './obj';

export class FunctionObj implements EnvObj {
    constructor(
        private parameters: Identifier[] = [],
        private body: BlockStatement | null = null,
        private env: Environment | null = null
    ) {}

    get Parameters() {
        return this.parameters;
    }
    set Parameters(val) {
        this.parameters = val;
    }

    get Body() {
        return this.body;
    }
    set Body(val) {
        this.body = val;
    }

    get Env() {
        return this.env;
    }
    set Env(val) {
        this.env = val;
    }

    Type(): EnvObjType {
        return EnvObjType.FUNCTION;
    }

    Inspect(): string {
        const params = this.parameters.map((p) => p.toString()).join(', ');
        return `fn(${params}) {
            ${this.body?.toString()}
        }`;
    }

    Equals(obj: EnvObj) {
        return obj === this;
    }
}
