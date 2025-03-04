import {APIGatewayProxyEvent, APIGatewayProxyResultV2} from "aws-lambda";
import {FunctionError, verify} from "./errors";
import {
    DynamoDBDocumentClient,
    TransactWriteCommand,
    TransactWriteCommandInput,
    TransactWriteCommandOutput
} from "@aws-sdk/lib-dynamodb";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    const client: DynamoDBClient = new DynamoDBClient();
    const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

    try {
        const body: string | null = event.body;
        console.log(body)
        if (body === null) throw new FunctionError(404, "Body is missing");

        const parsedBody = JSON.parse(body);
        if (!parsedBody) throw new FunctionError(404, "Body has no content.")

        const listToAddTo: string | undefined = parsedBody.listElement;
        const toDo: string | undefined = parsedBody.toDo;

        if (!listToAddTo || !toDo) throw new FunctionError(404, "toDo or list missing in body.")

        const listToAddToAsSet: Set<string> = new Set<string>(listToAddTo);
        const toDoAsSet: Set<string> = new Set<string>(toDo);

        const transactionInput: TransactWriteCommandInput = {
            TransactItems: [{
                Update: {
                    TableName: "ToDos",
                    Key: {
                        Id: toDo
                    },
                    UpdateExpression: "Add inLists :list",
                    ExpressionAttributeValues: {
                        ":list": listToAddToAsSet,
                    }
                },
            }, {
                Update: {
                    TableName: "Lists",
                    Key: {
                        id: listToAddTo
                    },
                    UpdateExpression: "Add ToDos :toDo",
                    ExpressionAttributeValues: {
                        ":toDo": toDoAsSet
                    }
                }
            }]
        };

        const transactionOutput: TransactWriteCommandOutput = await sendTransaction(transactionInput, docClient);
        verify({
            statusCode: 500,
            param: transactionOutput,
            message: "Update failed or no update completed."
        })
        return {
            statusCode: 200,
            body: JSON.stringify("Success.")
        }
    } catch (e: any) {
        if (e instanceof FunctionError) {
            return {
                statusCode: e.statusCode,
                body: JSON.stringify(e.message)
            }
        }
        return {
            statusCode: 500,
            body: JSON.stringify("Undefined error.")
        }
    }
};

const sendTransaction = async (transactionInput: TransactWriteCommandInput, docClient: DynamoDBDocumentClient) => {
    try {
        const transactionOutput: TransactWriteCommandOutput = await docClient.send(new TransactWriteCommand(transactionInput));
        return transactionOutput;
    } catch (e: any) {
        throw new FunctionError(500, e.message);
    }
}
