import { Token } from '../lexer/tokens';

import { Identifier } from './Identifier';
import { AstNodeCategory, AstNodeType, Expression, Statement } from './node';

export class LetStatement implements Statement {
    constructor(
        private _token?: Token,
        private _name?: Identifier,
        private _value?: Expression
    ) {}
    nodeType: AstNodeType = AstNodeType.LetStatement;
    nodeCategory: AstNodeCategory = AstNodeCategory.Statement;

    get Token(): Token {
        return this._token as Token;
    }

    set Token(val: Token) {
        this._token = val;
    }

    get Name() {
        return this._name;
    }

    set Name(val) {
        this._name = val;
    }

    get Value() {
        return this._value;
    }

    set Value(val) {
        this._value = val;
    }

    tokenLiteral(): string {
        return this._token?.literal || '';
    }

    toString(): string {
        return `${this.tokenLiteral()} ${this.Name?.toString()} = ${this.Value?.toString()};`;
    }
}
