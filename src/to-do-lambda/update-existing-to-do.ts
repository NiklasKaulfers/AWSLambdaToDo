import {APIGatewayProxyEventPathParameters, APIGatewayProxyResultV2} from "aws-lambda";
import {GetCommandInput, GetCommandOutput, PutCommandInput, PutCommandOutput} from "@aws-sdk/lib-dynamodb";
import {getRequestDB, putRequestDB} from "./helpers/ddb-helper";
import {FunctionError} from "./errors/function-error";
import {ToDo} from "./helpers/to-do";

export const updateExistingToDo
    = async (pathParameters?: APIGatewayProxyEventPathParameters, body?: string): Promise<APIGatewayProxyResultV2> => {


    const id: string = verifyPathParameters(pathParameters);
    const toDo: ToDo = verifyBodyAsToDo(body);


    const valuesStoredInDB = getStateOfToDoStoredInDB(id);

    const successfulDBWrite: PutCommandOutput = await sendUpdate(toDo);
    if (!successfulDBWrite) throw new FunctionError(500, "Dynamo DB did not return properly.");
    return {
        statusCode: 200,
        body: JSON.stringify({message: `Successfully updated ${id}`})
    }
}

const verifyPathParameters
    = (pathParameters?: APIGatewayProxyEventPathParameters) => {

    if (!pathParameters) throw new FunctionError(404, "Path parameters are missing.")
    if (!pathParameters.id) throw new FunctionError(404, "Id is missing in Path parameters.")
    return pathParameters.id;
}

const verifyBodyAsToDo = (body?: string): ToDo => {
    if (!body) throw new FunctionError(404, "Body is missing.");
    const parsedBody = JSON.parse(body);
    if (parsedBody instanceof ToDo) return parsedBody
    throw new FunctionError(400, "Needs Syntax of ToDo:" +
        "toDoId: string,\n" +
        "title: string,\n" +
        "description?: string,\n" +
        "isCompleted?: boolean,\n" +
        "inLists?: string[]}");
}

const getStateOfToDoStoredInDB = async (toDoId: string) => {
    const getItemInput: GetCommandInput = {
        TableName: "ToDos",
        Key: {
            Id: toDoId
        }
    };
    const dbReturnValues: GetCommandOutput = await getRequestDB(getItemInput);
    return dbReturnValues.Item;
}


const sendUpdate = async (toDo: ToDo): Promise<PutCommandOutput> => {
    const input: PutCommandInput = {
        TableName: "ToDos",
        Item: toDo.dto(),
        ConditionExpression: "attribute_exists(Id)"
    };
    return await putRequestDB(input);
}