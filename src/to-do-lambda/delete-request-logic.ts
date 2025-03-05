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

export const deleteRequestLogic
    = async (pathParameters?: APIGatewayProxyEventPathParameters): Promise<APIGatewayProxyResultV2> => {

    const error: FunctionError | undefined = verifyNeededParameters(pathParameters);
    if (error) throw error;


    const toDoId: string = pathParameters!.id!;
    const listIds: string[] = await getToDosFromDb(toDoId);

    await sendDbDelete(toDoId, listIds);

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


const getToDosFromDb = async (id: string): Promise<string[]> => {
    // transact write uses the TransactWriteItem Interface
    const dbInput: GetCommandInput = {
        TableName: "ToDos",
        Key: {
            Id:  id
        },
        AttributesToGet: ["inLists"]
    }
    const dbAnswer: GetCommandOutput = await getRequestDB(dbInput);
    const listIds: string[] | undefined = Array.from(dbAnswer.Item?.inLists);
    if (!listIds) throw new FunctionError(404, "No list returned.");
    return listIds;
}


const sendDbDelete = async (toDoId: string, listIds: string[]) => {
    const transactWriteCommandInput = createInput(toDoId, listIds);

    const dbResponse: TransactWriteCommandOutput = await transactRequestDB(transactWriteCommandInput);
    return dbResponse;
}

const createInput = (toDoId: string, listIds: string[]): TransactWriteCommandInput => {
    const transactItems = listIds
        .map((listId): TransactWriteCommandInput => {
            return {
                TransactItems:
                    [{
                        Update: {
                            TableName: "Lists",
                            Key: {
                                id: listId
                            },
                            ExpressionAttributeValues: {
                                ":toDo": new Set(toDoId)
                            },
                            UpdateExpression: "Delete ToDos :toDo",
                        }
                    }]
            }
        })
        .concat(createDeletesArray(toDoId))
        .map(transactWriteCommandInput => transactWriteCommandInput.TransactItems || [])
        .flat()

    return {
        TransactItems: transactItems
    }
}


const createDeletesArray = (id: string): TransactWriteCommandInput => {
    return {
        TransactItems: [
            {
                Delete: {
                    TableName: "ToDos",
                    Key: {
                        Id: id
                    }
                }
            }
        ]
    }
}