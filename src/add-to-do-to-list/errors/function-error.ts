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
