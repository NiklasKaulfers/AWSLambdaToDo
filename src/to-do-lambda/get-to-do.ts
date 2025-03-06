import {verify} from "./helpers/helpers";
import {GetItemCommandOutput} from "@aws-sdk/client-dynamodb";
import {APIGatewayProxyEventPathParameters, APIGatewayProxyResultV2} from "aws-lambda";
import {getRequestDB} from "./helpers/ddb-helper";
import {FunctionError} from "./errors/function-error";
import {GetCommandInput} from "@aws-sdk/lib-dynamodb";

const TODO_TABLE_NAME = process.env.TODO_TABLENAME


export const getToDo
    = async (pathParameters?: APIGatewayProxyEventPathParameters): Promise<APIGatewayProxyResultV2> => {

    const pathVerification: FunctionError | string = verifyPath(pathParameters);
    if (pathVerification instanceof FunctionError) throw pathVerification;
    const requestAnswer: GetItemCommandOutput = await sendGetRequestOnToDos(pathVerification);

    return {
        statusCode: 200,
        body: JSON.stringify(requestAnswer.Item)
    }
}

const verifyPath = (pathParameters?: APIGatewayProxyEventPathParameters): FunctionError | string => {
    try {
        verify({
            param: pathParameters,
            statusCode: 404,
            message: "Path parameters are missing."
        });
        verify({
            param: pathParameters?.id,
            statusCode: 404,
            message: "Id in path missing"
        })
    } catch (e) {
        if (e instanceof FunctionError) {
            return e;
        }
    }
    if (pathParameters && pathParameters.id) return pathParameters.id;
    // technically redundant, however needed for functioning code
    return new FunctionError(500, "Internal Server Error")
}

const sendGetRequestOnToDos = async (toDoId: string) => {
    const getInput: GetCommandInput = {
        TableName: TODO_TABLE_NAME,
        Key: {
            Id: toDoId
        }
    };
    return await getRequestDB(getInput);
}