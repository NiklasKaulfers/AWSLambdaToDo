import { APIGatewayProxyResultV2} from "aws-lambda";
import {FunctionError} from "./errors/function-error";
import {verify} from "./helpers/helpers";
import {ToDo} from "./helpers/to-do";
import {PutCommandInput, PutCommandOutput} from "@aws-sdk/lib-dynamodb";
import {putRequestDB} from "./helpers/ddb-helper";

const TODO_TABLE_NAME = process.env.TODO_TABLE_NAME;


export const createNewToDoInDb
    = async (body?: string): Promise<APIGatewayProxyResultV2> => {

    const toDo: ToDo = verifyBodyAsToDo(body)

    const dbResponse: PutCommandOutput = await sendPostRequestWithToDoToDB(toDo);
    if (!dbResponse) throw new FunctionError(400, "Dynamo DB didnt respond.")
    return {
        statusCode: 200,
        body: JSON.stringify("Success.")
    }
}

const verifyBodyAsToDo = (body?: string): ToDo => {
    verify({
        param: body,
        message: "Body is missing.",
        statusCode: 404
    });
    const parsedBody = JSON.parse(body!);
    if (!(parsedBody instanceof ToDo)) throw new FunctionError(400, "Needs Syntax of ToDo:" +
        "toDoId: string,\n" +
        "title: string,\n" +
        "description?: string,\n" +
        "isCompleted?: boolean,\n" +
        "inLists?: string[]}");
    return parsedBody;
}

const sendPostRequestWithToDoToDB = async (toDo: ToDo): Promise<PutCommandOutput> => {
    const input: PutCommandInput = {
        TableName: TODO_TABLE_NAME,
        Item: toDo.dto(),
        ConditionExpression: "attribute_not_exists(id)"
    }
    return await putRequestDB(input);
}