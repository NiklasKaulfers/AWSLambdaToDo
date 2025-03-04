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

export function existsForApiGateway<T>(check: T, successMessage: string, errorMessage: string, successStatusCode?: number, errorStatusCode?: number): GatewayResult {
    if (!check) {
        return {
            statusCode: errorStatusCode ?? 404,
            body: JSON.stringify({message: errorMessage}),
        }
    }
    return{
        statusCode: successStatusCode ?? 200,
        body: JSON.stringify({message: successMessage}),
    }
}

interface GatewayResult{
    statusCode?: number,
    body?: string
}