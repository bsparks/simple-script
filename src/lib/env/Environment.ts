import { EnvObj } from './obj';

export class Environment {
    private store: Map<string, EnvObj> = new Map();
    private outer: Environment | null = null;

    constructor(outer?: Environment) {
        if (outer) {
            this.outer = outer;
        }
    }

    public Get(name: string) {
        let obj = this.store.get(name);
        if (!obj && this.outer) {
            obj = this.outer.Get(name);
        }

        return obj;
    }

    public Set(name: string, value) {
        this.store.set(name, value);
        return value;
    }
}
