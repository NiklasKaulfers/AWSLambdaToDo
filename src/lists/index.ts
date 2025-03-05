import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {
    DynamoDBClient,
    GetItemCommand,
    GetItemCommandOutput,
    GetItemInput,

} from "@aws-sdk/client-dynamodb";
import {Lists} from "./helpers/lists";
import {FunctionError} from "./errors/function-error"
import {PutCommand, PutCommandInput, PutCommandOutput} from "@aws-sdk/lib-dynamodb";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const client = new DynamoDBClient();
    const method: string = event.httpMethod;
    const body: string | null = event.body;

    try {
        console.log(`Http request with method: ${method}`);
        switch (method) {
            case "GET":
                if (!event.pathParameters || event.pathParameters.id === undefined) break;
                return await getItemRequest(event.pathParameters.id, client);
            case "POST":
                if (!body) throw new Error("Invalid body");

                const listForPost: string | null = JSON.parse(body).id;
                const nameForPost: string = JSON.parse(body).name;
                const toDosInList: string[] | null = JSON.parse(body).ToDos;

                if (!listForPost) throw new FunctionError(400, "id is missing.")
                if (!nameForPost) throw new FunctionError(400, "name is missing.")

                if (!toDosInList) throw new FunctionError(400, "ToDos are missing.");

                const toDosAsSet: Set<string> = new  Set<string>(toDosInList)

                const toDos = new Lists(listForPost, nameForPost, toDosAsSet);
                const paramsForPost: PutCommandInput = {
                    TableName: "Lists",
                    Item: toDos.dto(),
                    ConditionExpression: "attribute_not_exists(id)"
                }
                const postItemInput: PutCommandOutput = await client.send(new PutCommand(paramsForPost));
                if (postItemInput) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({message: `Item posted.`}),
                    }
                }
                throw new FunctionError(400, "Can't post item.");

            case "PUT":
                if (!body) break;

                if (!event.pathParameters || !event.pathParameters.id) {
                    throw new FunctionError(404, "Missing path parameters.")
                }
                const listId: string = event.pathParameters.id;

                // checks if id exists in db
                const getItemOutputForPut = await getItemRequest(listId, client);
                if (!getItemOutputForPut || getItemOutputForPut.statusCode !== 200) {
                    return getItemOutputForPut;
                }

                // if the var is defined in req body use the one from the body else use the one received from db
                // improved syntax
                const existingItemParsed = JSON.parse(body);
                const updatedItemParsed = JSON.parse(getItemOutputForPut.body);
                const nameForPut: string = updatedItemParsed.name ?? existingItemParsed.name.S;
                const toDosForPut: string[] = updatedItemParsed.ToDos ?? existingItemParsed.ToDos.SS;
                if (!toDosForPut) throw new FunctionError(400, "Id is missing in request body.")
                if (!nameForPut) throw new FunctionError(400, "Name is missing in request body.")

                const toDosForPutAsSet: Set<string> = new Set<string>(toDosForPut)

                const listForPut = new Lists(listId, nameForPut, toDosForPutAsSet);
                const items = listForPut.dto();

                const paramsForPut: PutCommandInput = {
                    TableName: "Lists",
                    Item: items,
                    ConditionExpression: "attribute_exists(id)"
                }

                const putItemInput: PutCommandOutput = await client.send(new PutCommand(paramsForPut));
                if (putItemInput) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({message: `Item at: ${event.pathParameters.id} is now changed`}),
                    }
                }
                throw new FunctionError(400, "Can't post item.");
            case "DELETE":
                // todo: impl
                throw new FunctionError(400, "Not implemented.");
            default:
            // nothing being done here
        }
    } catch (e) {
        if (e instanceof FunctionError) {
            return {
                statusCode: e.statusCode,
                body: JSON.stringify({message: e.message})
            }
        }
        return {
            statusCode: 400,
            body: JSON.stringify({error: `Could not determinate the type of Error`}),
        }
    }
    return {
        statusCode: 500,
        body: JSON.stringify(({error: "Code executed without any functionality."})),
    }
}

const getItemRequest = async (list: string, client: DynamoDBClient): Promise<APIGatewayProxyResult> => {
    const paramsForGet: GetItemInput = {
        TableName: "Lists",
        Key: {
            id: {
                S: list
            }
        }
    };
    const getItemOutput: GetItemCommandOutput = await client.send(new GetItemCommand(paramsForGet));
    if (getItemOutput) {
        return {
            statusCode: 200,
            body: JSON.stringify(getItemOutput.Item)
        }
    }
    throw new FunctionError(400, `List ${list} not found.`);
}