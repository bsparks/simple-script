import test from 'ava';

import { isDigit, isLetter } from './tokens';

test('isDigit', (t) => t.is(isDigit('1'), true));
test('isDigit should return false for letters', (t) =>
    t.is(isDigit('a'), false));
test('isDigit', (t) => t.is(isDigit(null), false));
test('isDigit', (t) => t.is(isDigit(1), true));

test('isLetter', (t) => t.is(isLetter('a'), true));
test('isLetter', (t) => t.is(isLetter('Z'), true));
test('isLetter', (t) => t.is(isLetter(null), false));
test('isLetter', (t) => t.is(isLetter(9), false));
