const { Lexer, Parser, Evaluator, Environment } = require('./build/main');

let test = `
let {stage.vft.Score} = 1;
let {stage.vft.Map complete} = 2;
let {session.tutorialScore} = 200;
let beans = {stage.vft.Score}*70 + {stage.vft.Map complete}*100 - {session.tutorialScore};
beans;
`;

let test2 = `
let foo = 1;
if (foo == 1) << let {bar soap} = 100; >>
`;

lex = new Lexer(test);
p = new Parser(lex);

env = new Environment();
e = new Evaluator();

prog = p.parseProgram();

console.log(prog);

result = e.eval(prog, env);

console.log('RESULT: ', result.Inspect());
