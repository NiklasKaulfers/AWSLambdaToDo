import {
    APIGatewayProxyEvent, APIGatewayProxyResultV2
} from 'aws-lambda';
import {handleRequest} from "./request-manager";
import {errorHandler} from "./errors/error-handler";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    try {
        return handleRequest(event.httpMethod, event.body || undefined, event.pathParameters || undefined);
    } catch (e:any) {
        errorHandler(e)
    }
    return {
        statusCode: 500,
        body: JSON.stringify({error: "Did not execute function."})
    }
}