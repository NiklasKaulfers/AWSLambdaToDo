import {HttpMethods} from "./constants/http-methods";
import {getRequestLogic} from "./get-request-logic";
import {APIGatewayProxyEventPathParameters} from "aws-lambda";
import {postRequestLogic} from "./post-request-logic";
import {FunctionError} from "./errors/function-error";
import {putRequestLogic} from "./put-request-logic";
import {deleteToDoAndLinkedLists} from "./delete-to-do-and-linked-lists";

export const handleRequest = async (method: string, body?: string, pathParameters?: APIGatewayProxyEventPathParameters) => {
    switch (method) {
        case HttpMethods.DELETE:
            return deleteToDoAndLinkedLists(pathParameters);
        case HttpMethods.POST:
            return postRequestLogic(body);
        case HttpMethods.GET:
            return getRequestLogic(pathParameters);
        case HttpMethods.PUT:
            return putRequestLogic(pathParameters, body);
        default:
            throw new FunctionError(500, "No method detected.")
    }
}
