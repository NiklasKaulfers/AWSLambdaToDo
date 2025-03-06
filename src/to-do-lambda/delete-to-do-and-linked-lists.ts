import {APIGatewayProxyEventPathParameters, APIGatewayProxyResultV2} from "aws-lambda";
import {FunctionError} from "./errors/function-error";
import {getRequestDB, transactRequestDB} from "./helpers/ddb-helper";
import {
    GetCommandInput,
    GetCommandOutput,
    TransactWriteCommandInput,
    TransactWriteCommandOutput
} from "@aws-sdk/lib-dynamodb";
import {verify} from "./helpers/helpers";


const TODO_TABLE_NAME = process.env.TODO_TABLE_NAME;
const LIST_TABLE_NAME = process.env.LIST_TABLE_NAME;

export const deleteToDoAndLinkedLists
    = async (pathParameters?: APIGatewayProxyEventPathParameters): Promise<APIGatewayProxyResultV2> => {

    const error: FunctionError | undefined = verifyNeededParameters(pathParameters);
    if (error) throw error;


    const toDoId: string = pathParameters!.id!;
    const listIds: string[] = await getListsContainingToDoFromDB(toDoId);

    await deleteToDoAndConnectedListsFromDB(toDoId, listIds);

    return {
        statusCode: 200,
        body: JSON.stringify({message: `Successfully deleted ToDo ${toDoId} `})
    }

}

const verifyNeededParameters = (pathParameters?: APIGatewayProxyEventPathParameters): FunctionError | undefined => {
    try {
        verify({
            param: pathParameters,
            statusCode: 404,
            message: "Path parameters are missing."
        })
        verify({
            param: pathParameters!.id,
            statusCode: 404,
            message: "Id within path parameters is missing."
        })
    } catch (e) {
        if (e instanceof FunctionError) {
            return e;
        }
        throw new FunctionError(500, "Internal Server Error.")
    }
}


const getListsContainingToDoFromDB = async (toDoId: string): Promise<string[]> => {
    const dbInput: GetCommandInput = {
        TableName: TODO_TABLE_NAME,
        Key: {
            Id:  toDoId
        },
        AttributesToGet: ["inLists"]
    }
    const dbAnswer: GetCommandOutput = await getRequestDB(dbInput);
    const listIds: string[] | undefined = Array.from(dbAnswer.Item?.inLists);
    if (!listIds) throw new FunctionError(404, "No list returned.");
    return listIds;
}


const deleteToDoAndConnectedListsFromDB = async (toDoId: string, listIdsContainingToDo: string[]) => {
    const transactWriteCommandInput = createTransactWriteCommandInputToDeleteToDoAndConnectedLists(toDoId, listIdsContainingToDo);

    const dbResponse: TransactWriteCommandOutput = await transactRequestDB(transactWriteCommandInput);
    return dbResponse;
}

const createTransactWriteCommandInputToDeleteToDoAndConnectedLists = (toDoId: string, listIdsContainingToDo: string[]): TransactWriteCommandInput => {
    const transactItems = listIdsContainingToDo
        .map((listIdContainingToDo): TransactWriteCommandInput => {
            return {
                TransactItems:
                    [{
                        Update: {
                            TableName: LIST_TABLE_NAME,
                            Key: {
                                id: listIdContainingToDo
                            },
                            ExpressionAttributeValues: {
                                ":toDo": new Set(toDoId)
                            },
                            UpdateExpression: "Delete ToDos :toDo",
                        }
                    }]
            }
        })
        .concat(createTransactDeleteOfToDo(toDoId))
        .map(transactWriteCommandInput => transactWriteCommandInput.TransactItems || [])
        .flat()

    return {
        TransactItems: transactItems
    }
}


const createTransactDeleteOfToDo = (toDoId: string): TransactWriteCommandInput => {
    return {
        TransactItems: [
            {
                Delete: {
                    TableName: TODO_TABLE_NAME,
                    Key: {
                        Id: toDoId
                    }
                }
            }
        ]
    }
}