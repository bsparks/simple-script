import { BoolObj } from '../env/BoolObj';
import { BuiltInFunction, BuiltInFunctionObj } from '../env/BuiltinFunction';
import { ErrorObj } from '../env/ErrorObj';
import { NullObj } from '../env/NullObj';
import { NumberObj } from '../env/NumberObj';
import { EnvObj, EnvObjType } from '../env/obj';

export const NULL = new NullObj();
export const TRUE = new BoolObj(true);
export const FALSE = new BoolObj(false);

const builtinRound: BuiltInFunction = (input: EnvObj) => {
    if (input.Type() !== EnvObjType.NUMBER) {
        return new ErrorObj('invalid input type');
    }
    const num = input as NumberObj;
    return new NumberObj(Math.round(num.Value));
};

export const builtins: Record<string, BuiltInFunctionObj> = {
    round: new BuiltInFunctionObj(builtinRound),
};
