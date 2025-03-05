import {FunctionError} from "../errors/function-error";

interface VerifyProps<T> {
    param: T,
    statusCode: number,
    message: string,
}

export function verify<T>(props: VerifyProps<T>): boolean {
    if (props.param) return true;
    throw new FunctionError(props.statusCode, props.message);
}