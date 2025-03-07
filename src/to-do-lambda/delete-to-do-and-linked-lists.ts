import {APIGatewayProxyEventPathParameters, APIGatewayProxyResultV2} from "aws-lambda";
import {FunctionError} from "./errors/function-error";
import {getRequestDB, transactRequestDB} from "./helpers/ddb-helper";
import {
    GetCommandInput,
    GetCommandOutput,
    TransactWriteCommandInput,
    TransactWriteCommandOutput
} from "@aws-sdk/lib-dynamodb";
import {TransactWriteCommandInputGenerator} from "./helpers/TransactWriteCommandInputGenerator";


export const deleteToDoAndLinkedLists
    = async (toDoTableName: string, listTableName: string, pathParameters?: APIGatewayProxyEventPathParameters): Promise<APIGatewayProxyResultV2> => {

    const toDoId: string = verifyNeededParameters(pathParameters);

    const listIds: string[] = await getListsContainingToDoFromDB(toDoTableName, toDoId);

    await deleteToDoAndConnectedListsFromDB(toDoTableName, toDoId, listTableName, listIds);

    return {
        statusCode: 204,
        body: JSON.stringify({message: `Successfully deleted ToDo ${toDoId} `})
    }

}

const verifyNeededParameters = (pathParameters?: APIGatewayProxyEventPathParameters): string => {
    if (!pathParameters) throw new FunctionError(404, "Path parameters are missing.");
    if (!pathParameters.id) throw new FunctionError(404, "id in path parameters is missing.")
    return pathParameters.id;
}


const getListsContainingToDoFromDB = async (toDoTableName: string, toDoId: string): Promise<string[]> => {
    const dbInput: GetCommandInput = {
        TableName: toDoTableName,
        Key: {
            Id: toDoId
        },
        AttributesToGet: ["inLists"]
    }
    const dbAnswer: GetCommandOutput = await getRequestDB(dbInput);
    const listIds: string[] | undefined = Array.from(dbAnswer.Item?.inLists);
    if (!listIds) throw new FunctionError(404, "No list returned.");
    return listIds;
}


const deleteToDoAndConnectedListsFromDB = async (toDoTableName: string, toDoId: string,listTableName: string, listIdsContainingToDo: string[]) => {
    const transactWriteCommandInput: TransactWriteCommandInput | undefined = new TransactWriteCommandInputGenerator()
        .deleteToDoFromToDos(toDoTableName, toDoId)
        .deleteReferencesToToDoFromLists(toDoId, listTableName, listIdsContainingToDo)
        .transcatWriteCommandInput;
    if (!transactWriteCommandInput) throw new FunctionError(400, "Could not generate Transaction Input.");
    const dbResponse: TransactWriteCommandOutput = await transactRequestDB(transactWriteCommandInput);
    return dbResponse;
}
