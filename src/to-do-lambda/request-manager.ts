import {HttpMethods} from "./constants/http-methods";
import {getToDo} from "./get-to-do";
import {APIGatewayProxyEventPathParameters} from "aws-lambda";
import {createNewToDoInDb} from "./create-new-to-do-in-db";
import {FunctionError} from "./errors/function-error";
import {updateExistingToDo} from "./update-existing-to-do";
import {deleteToDoAndLinkedLists} from "./delete-to-do-and-linked-lists";

export const handleRequest = async (method: string, body?: string, pathParameters?: APIGatewayProxyEventPathParameters) => {
    switch (method) {
        case HttpMethods.DELETE:
            return deleteToDoAndLinkedLists(pathParameters);
        case HttpMethods.POST:
            return createNewToDoInDb(body);
        case HttpMethods.GET:
            return getToDo(pathParameters);
        case HttpMethods.PUT:
            return updateExistingToDo(pathParameters, body);
        default:
            throw new FunctionError(500, "No method detected.")
    }
}
