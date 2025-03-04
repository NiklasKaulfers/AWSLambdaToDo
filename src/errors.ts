export class FunctionError extends Error {
    private readonly _statusCode: number;
    private readonly _message: string;

    constructor(statusCode: number, message: string) {
        super(message);
        this._statusCode = statusCode;
        this._message = message;
    }

    get statusCode(): number {
        return this._statusCode;
    }

    get message(): string {
        return this._message;
    }
}


// simply with non-existing parameters like statuscode? or message?
// add new things like error?
interface VerifyProps<T> {
    param: T,
    statusCode: number,
    message: string,
}

export function verify<T>(props: VerifyProps<T>): boolean {
    if (props.param) return true;
    throw new FunctionError(props.statusCode, props.message);
}