import {
    APIGatewayProxyEvent, APIGatewayProxyResultV2
} from 'aws-lambda';
import {handleRequest} from "./request-manager";
import {errorHandler} from "./errors/error-handler";
import {FunctionError} from "./errors/function-error";

const TODO_TABLE_NAME = process.env.TODO_TABLE_NAME;
const LIST_TABLE_NAME = process.env.LIST_TABLE_NAME;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    try {
        if (!TODO_TABLE_NAME || !LIST_TABLE_NAME) throw new FunctionError(500, "Internal Server Error.")
        return handleRequest(TODO_TABLE_NAME, LIST_TABLE_NAME, event.httpMethod, event.body || undefined, event.pathParameters || undefined);
    } catch (e:any) {
        errorHandler(e)
    }
    return {
        statusCode: 500,
        body: JSON.stringify({error: "Did not execute function."})
    }
}