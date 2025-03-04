import {APIGatewayProxyEventPathParameters, APIGatewayProxyResultV2} from "aws-lambda";
import {GetCommandInput, GetCommandOutput, PutCommandInput, PutCommandOutput} from "@aws-sdk/lib-dynamodb";
import {getRequestDB, putRequestDB} from "./helpers/ddb-helper";
import {FunctionError} from "./errors/function-error";
import {ToDo} from "./helpers/to-do";

export const putRequestLogic
    = async (pathParameters?: APIGatewayProxyEventPathParameters, body?: string): Promise<APIGatewayProxyResultV2> => {



    verifyNeededParameters(pathParameters, body);

    // verify ensures they exist
    const id: string = pathParameters!.id!;
    const parsedBody = JSON.parse(body!);

    const valuesStoredInDB = getCurrentState(id);
    const newStateOfToDo: ToDo = checkInputAgainstStoredValues(parsedBody, valuesStoredInDB, id);

    const successfulDBWrite: PutCommandOutput = await sendUpdate(newStateOfToDo);
    if (!successfulDBWrite) throw new FunctionError(500, "Dynamo DB did not return properly.");
    return {
        statusCode: 200,
        body: JSON.stringify({message: `Successfully updated ${id}`})
    }
}

const verifyNeededParameters
    = (pathParameters?: APIGatewayProxyEventPathParameters, body?: string) => {

    if (!pathParameters) throw new FunctionError(404, "Path parameters are missing.")
    if (!pathParameters.id) throw new FunctionError(404, "Id is missing in Path parameters.")
    if (!body) throw new FunctionError(404, "Body is missing.")
}

const getCurrentState = async (id: string) => {
    const getItemInput: GetCommandInput = {
        TableName: "ToDos",
        Key: {
            Id: id
        }
    };
    const dbReturnValues: GetCommandOutput = await getRequestDB(getItemInput);
    return dbReturnValues.Item;
}

const checkInputAgainstStoredValues
    = (parsedBody: any, storedValues: Record<string, any>, id: string): ToDo => {

    const title: string = parsedBody.title ?? storedValues.title;
    const isCompleted: boolean = parsedBody.isCompleted ?? storedValues.isCompleted;
    const description: string = parsedBody.description ?? storedValues.description ?? "";
    const inLists: Set<string> = new Set<string>(parsedBody.inLists) ?? storedValues.inLists;

    return new ToDo(id, isCompleted, title, inLists, description);
}

const sendUpdate = async (toDo: ToDo): Promise<PutCommandOutput> => {
    const input: PutCommandInput = {
        TableName: "ToDos",
        Item: toDo.dto(),
        ConditionExpression: "attribute_exists(Id)"
    };
    return await putRequestDB(input);
}