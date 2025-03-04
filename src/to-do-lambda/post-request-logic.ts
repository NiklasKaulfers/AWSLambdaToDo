import { APIGatewayProxyResultV2} from "aws-lambda";
import {FunctionError} from "./errors/function-error";
import {verify} from "./helpers/helpers";
import {ToDo} from "./helpers/to-do";
import {PutCommandInput, PutCommandOutput} from "@aws-sdk/lib-dynamodb";
import {putRequestDB} from "./helpers/ddb-helper";

export const postRequestLogic
    = async (body?: string): Promise<APIGatewayProxyResultV2> => {

    const error: FunctionError | undefined = verifyBody(body)
    if (error) throw error;

    const parsedBody: any = JSON.parse(body!);
    if (!verifyBody(parsedBody)) throw new FunctionError(500, "Internal Server Error.");
    const dbResponse: PutCommandOutput = await sendRequestToDB(parsedBody);
    checkResponse(dbResponse)
    return {
        statusCode: 200,
        body: JSON.stringify("Success.")
    }
}

const verifyBody = (body?: string): FunctionError | undefined => {
    try{
        verify({
            param: body,
            message: "Body is missing.",
            statusCode: 404
        });
        const parsedBody = JSON.parse(body!);
        verify({
            param: parsedBody.id,
            message: "Id is missing",
            statusCode: 404
        });
        verify({
            param: parsedBody.title,
            message: "Title is missing",
            statusCode: 404
        })
    }catch (e) {
        if (e instanceof FunctionError){
            return e;
        }
        throw new FunctionError(500, "Internal Server Error")
    }
}

const sendRequestToDB = async (parsedBody: any): Promise<PutCommandOutput> => {
    const title: string = parsedBody.title;
    const id: string = parsedBody.id;
    const description: string = parsedBody.description ?? "";
    const isCompleted: boolean = parsedBody.isCompleted ?? false;
    const inLists: Set<string> = new Set<string>(parsedBody.inLists) ?? new Set<string>("0");

    const toDo: ToDo = new ToDo(id, isCompleted, title, inLists, description);
    return await sendFormattedRequestToDB(toDo);
}

const sendFormattedRequestToDB = async (toDo: ToDo): Promise<PutCommandOutput> => {
    const input: PutCommandInput = {
        TableName: "ToDos",
        Item: toDo.dto(),
        ConditionExpression: "attribute_not_exists(id)"
    }
    return await putRequestDB(input);
}

const checkResponse = (response: any) => {
    verify({
        param: response,
        message: "DynamoDB write failed.",
        statusCode: 500
    })
}