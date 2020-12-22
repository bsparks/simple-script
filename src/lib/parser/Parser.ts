import { Lexer } from '../..';
import { ArrayLiteral } from '../ast/ArrayLiteral';
import { BlockStatement } from '../ast/BlockStatement';
import { BooleanLiteral } from '../ast/BooleanLiteral';
import { CallExpression } from '../ast/CallExpression';
import { ExpressionStatement } from '../ast/ExpressionStatement';
import { FunctionLiteral } from '../ast/FunctionLiteral';
import { HashLiteral } from '../ast/HashLiteral';
import { Identifier } from '../ast/Identifier';
import { IfExpression } from '../ast/IfExpression';
import { IndexExpression } from '../ast/IndexExpression';
import { InfixExpression } from '../ast/InfixExpression';
import { LetStatement } from '../ast/LetStatement';
import { NumberLiteral } from '../ast/NumberLiteral';
import { PrefixExpression } from '../ast/PrefixExpression';
import { ReturnStatement } from '../ast/ReturnStatement';
import { StringLiteral } from '../ast/StringLiteral';
import { Expression } from '../ast/node';
import { Program } from '../ast/program';
import { Token, TokenType } from '../lexer/tokens';

import {
    infixParseFn,
    OperatorPrecedence,
    precendences,
    prefixParseFn,
} from './operator';

export class Parser {
    private currToken: Token = { type: TokenType.ILLEGAL, literal: '' };
    private peekToken: Token = { type: TokenType.ILLEGAL, literal: '' };
    private prefixParseFns: Map<TokenType, prefixParseFn> = new Map();
    private infixParseFns: Map<TokenType, infixParseFn> = new Map();
    private errors: string[] = [];

    constructor(private readonly lexer: Lexer) {
        this.registerPrefix(TokenType.IDENT, this.parseIdentifier.bind(this));
        this.registerPrefix(
            TokenType.NUMBER,
            this.parseNumberLiteral.bind(this)
        );
        this.registerPrefix(
            TokenType.BANG,
            this.parsePrefixExpression.bind(this)
        );
        this.registerPrefix(
            TokenType.MINUS,
            this.parsePrefixExpression.bind(this)
        );
        this.registerPrefix(TokenType.TRUE, this.parseBoolean.bind(this));
        this.registerPrefix(TokenType.FALSE, this.parseBoolean.bind(this));
        this.registerPrefix(
            TokenType.LPAREN,
            this.parseGroupedExpression.bind(this)
        );
        this.registerPrefix(TokenType.IF, this.parseIfExpression.bind(this));
        this.registerPrefix(
            TokenType.FUNCTION,
            this.parseFunctionLiteral.bind(this)
        );
        this.registerPrefix(
            TokenType.STRING,
            this.parseStringLiteral.bind(this)
        );
        this.registerPrefix(
            TokenType.LBRACKET,
            this.parseArrayLiteral.bind(this)
        );
        this.registerPrefix(TokenType.LBRACE, this.parseHashLiteral.bind(this));

        this.registerInfix(
            TokenType.PLUS,
            this.parseInfixExpression.bind(this)
        );
        this.registerInfix(
            TokenType.MINUS,
            this.parseInfixExpression.bind(this)
        );
        this.registerInfix(
            TokenType.SLASH,
            this.parseInfixExpression.bind(this)
        );
        this.registerInfix(
            TokenType.ASTERISK,
            this.parseInfixExpression.bind(this)
        );
        this.registerInfix(TokenType.EQ, this.parseInfixExpression.bind(this));
        this.registerInfix(
            TokenType.NOT_EQ,
            this.parseInfixExpression.bind(this)
        );
        this.registerInfix(TokenType.LT, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.GT, this.parseInfixExpression.bind(this));
        this.registerInfix(
            TokenType.LPAREN,
            this.parseCallExpression.bind(this)
        );
        this.registerInfix(
            TokenType.LBRACKET,
            this.parseIndexExpression.bind(this)
        );

        // read 2 tokens to init currToken and peekToken
        this.nextToken();
        this.nextToken();
    }

    public parseProgram(): Program {
        const program = new Program();

        while (!this.currTokenIs(TokenType.EOF)) {
            const statement = this.parseStatement();
            if (statement) {
                program.addStatement(statement);
            }
            this.nextToken();
        }

        return program;
    }

    private parseStatement() {
        switch (this.currToken.type) {
            case TokenType.LET:
                return this.parseLetStatement();
            case TokenType.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private nextToken() {
        this.currToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    private currTokenIs(type: TokenType): boolean {
        return this.currToken.type === type;
    }

    private peekTokenIs(type: TokenType): boolean {
        return this.peekToken.type === type;
    }

    private peekError(type: TokenType) {
        const msg = `Expected next token to be ${type} instead got ${this.peekToken.type}`;
        this.errors.push(msg);
    }

    private expectPeek(type: TokenType): boolean {
        if (this.peekTokenIs(type)) {
            this.nextToken();
            return true;
        }

        this.peekError(type);
        return false;
    }

    private peekPrecedence(): OperatorPrecedence {
        const precedence = precendences.get(this.peekToken.type);
        if (precedence) {
            return precedence;
        }

        return OperatorPrecedence.LOWEST;
    }

    private currPrecedence(): OperatorPrecedence {
        const precedence = precendences.get(this.currToken.type);
        if (precedence) {
            return precedence;
        }

        return OperatorPrecedence.LOWEST;
    }

    protected registerPrefix(token: TokenType, fn: prefixParseFn) {
        this.prefixParseFns.set(token, fn);
    }

    protected registerInfix(token: TokenType, fn: infixParseFn) {
        this.infixParseFns.set(token, fn);
    }

    private parseLetStatement() {
        const stmt = new LetStatement({ ...this.currToken });

        if (!this.expectPeek(TokenType.IDENT)) {
            return null;
        }

        stmt.Name = new Identifier(
            { ...this.currToken },
            this.currToken.literal
        );

        if (!this.expectPeek(TokenType.ASSIGN)) {
            return null;
        }

        this.nextToken();

        stmt.Value = this.parseExpression(OperatorPrecedence.LOWEST);

        while (
            !this.currTokenIs(TokenType.SEMICOLON) &&
            !this.currTokenIs(TokenType.EOF)
        ) {
            this.nextToken();
        }

        return stmt;
    }

    private parseExpression(precedence: OperatorPrecedence) {
        const prefix = this.prefixParseFns.get(this.currToken.type);
        if (!prefix) {
            this.errors.push(
                `no prefix parse function for ${this.currToken.type} found`
            );
            return null;
        }
        let leftExp = prefix();

        while (
            !this.peekTokenIs(TokenType.SEMICOLON) &&
            !this.peekTokenIs(TokenType.EOF) &&
            precedence < this.peekPrecedence()
        ) {
            const infix = this.infixParseFns.get(this.peekToken.type);
            if (!infix) {
                return leftExp;
            }

            this.nextToken();

            leftExp = infix(leftExp);
        }

        return leftExp;
    }

    private parsePrefixExpression() {
        const expression = new PrefixExpression(
            { ...this.currToken },
            this.currToken.literal
        );

        this.nextToken();

        expression.Right = this.parseExpression(OperatorPrecedence.PREFIX);

        return expression;
    }

    private parseInfixExpression(left: Expression) {
        const expression = new InfixExpression(
            { ...this.currToken },
            this.currToken.literal,
            left
        );

        const precedence = this.currPrecedence();
        this.nextToken();
        expression.Right = this.parseExpression(precedence);

        return expression;
    }

    private parseIdentifier(): Expression {
        return new Identifier({ ...this.currToken }, this.currToken.literal);
    }

    private parseNumberLiteral() {
        const parsedVal = parseFloat(this.currToken.literal);
        if (isNaN(parsedVal)) {
            const err = `Could not parse ${this.currToken.literal} as number.`;
            this.errors.push(err);
            return null;
        }
        return new NumberLiteral({ ...this.currToken }, parsedVal);
    }

    private parseStringLiteral() {
        return new StringLiteral({ ...this.currToken }, this.currToken.literal);
    }

    private parseBoolean() {
        return new BooleanLiteral(
            { ...this.currToken },
            this.currTokenIs(TokenType.TRUE)
        );
    }

    private parseCallExpression(fn) {
        const expression = new CallExpression(
            { ...this.currToken },
            fn,
            this.parseExpressionList(TokenType.RPAREN)
        );
        return expression;
    }

    private parseFunctionLiteral() {
        const fn = new FunctionLiteral({ ...this.currToken });

        if (!this.expectPeek(TokenType.LPAREN)) {
            return null;
        }

        fn.Parameters = this.parseFunctionParameters();

        if (!this.expectPeek(TokenType.LBRACE)) {
            return null;
        }

        fn.Body = this.parseBlockStatement();

        return fn;
    }

    private parseFunctionParameters() {
        const params: Identifier[] = [];

        if (this.peekTokenIs(TokenType.RPAREN)) {
            this.nextToken();
            return params;
        }

        this.nextToken();

        params.push(
            new Identifier({ ...this.currToken }, this.currToken.literal)
        );

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            params.push(
                new Identifier({ ...this.currToken }, this.currToken.literal)
            );
        }

        if (!this.expectPeek(TokenType.RPAREN)) {
            return null;
        }

        return params;
    }

    private parseExpressionList(end: TokenType) {
        const list: Expression[] = [];

        if (this.peekTokenIs(end)) {
            this.nextToken();
            return list;
        }

        this.nextToken();
        list.push(this.parseExpression(OperatorPrecedence.LOWEST));

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            list.push(this.parseExpression(OperatorPrecedence.LOWEST));
        }

        if (!this.peekTokenIs(end)) {
            return null; // return nil
        }

        return list;
    }

    private parseArrayLiteral() {
        const arr = new ArrayLiteral(
            { ...this.currToken },
            this.parseExpressionList(TokenType.RBRACKET)
        );
        return arr;
    }

    private parseHashLiteral() {
        const hash = new HashLiteral({ ...this.currToken }, new Map());

        while (
            !this.peekTokenIs(TokenType.RBRACE) &&
            !this.peekTokenIs(TokenType.EOF)
        ) {
            this.nextToken();

            const key = this.parseExpression(OperatorPrecedence.LOWEST);
            if (!this.expectPeek(TokenType.COLON)) {
                return null;
            }

            this.nextToken();
            const value = this.parseExpression(OperatorPrecedence.LOWEST);

            hash.setPair(key, value);

            if (
                !this.peekTokenIs(TokenType.RBRACE) &&
                !this.expectPeek(TokenType.COMMA)
            ) {
                return null;
            }
        }

        if (!this.expectPeek(TokenType.RBRACE)) {
            return null;
        }

        return hash;
    }

    private parseIndexExpression(left) {
        const expression = new IndexExpression({ ...this.currToken }, left);

        this.nextToken();
        expression.Index = this.parseExpression(OperatorPrecedence.LOWEST);

        if (!this.expectPeek(TokenType.RBRACKET)) {
            return null;
        }

        return expression;
    }

    private parseGroupedExpression() {
        this.nextToken();

        const expression = this.parseExpression(OperatorPrecedence.LOWEST);

        if (!this.expectPeek(TokenType.RPAREN)) {
            return null;
        }

        return expression;
    }

    private parseReturnStatement() {
        const stmt = new ReturnStatement({ ...this.currToken });
        this.nextToken();
        stmt.ReturnValue = this.parseExpression(OperatorPrecedence.LOWEST);
        while (
            !this.currTokenIs(TokenType.SEMICOLON) &&
            !this.currTokenIs(TokenType.EOF)
        ) {
            this.nextToken();
        }
        return stmt;
    }

    private parseExpressionStatement() {
        const stmt = new ExpressionStatement(
            { ...this.currToken },
            this.parseExpression(OperatorPrecedence.LOWEST)
        );

        while (
            !this.currTokenIs(TokenType.SEMICOLON) &&
            !this.currTokenIs(TokenType.EOF)
        ) {
            this.nextToken();
        }

        return stmt;
    }

    private parseIfExpression() {
        const expression = new IfExpression({ ...this.currToken });

        if (!this.expectPeek(TokenType.LPAREN)) {
            return null;
        }

        this.nextToken();

        expression.Condition = this.parseExpression(OperatorPrecedence.LOWEST);

        if (!this.expectPeek(TokenType.RPAREN)) {
            return null;
        }

        if (!this.expectPeek(TokenType.OPEN_BLOCK)) {
            return null;
        }

        expression.Consequence = this.parseBlockStatement();

        if (this.peekTokenIs(TokenType.ELSE)) {
            this.nextToken();

            if (!this.expectPeek(TokenType.OPEN_BLOCK)) {
                return null;
            }

            expression.Alternative = this.parseBlockStatement();
        }

        return expression;
    }

    private parseBlockStatement() {
        const block = new BlockStatement({ ...this.currToken });

        this.nextToken();

        while (
            !this.currTokenIs(TokenType.CLOSE_BLOCK) &&
            !this.currTokenIs(TokenType.EOF)
        ) {
            block.addStatement(this.parseStatement());
            this.nextToken();
        }

        return block;
    }
}
