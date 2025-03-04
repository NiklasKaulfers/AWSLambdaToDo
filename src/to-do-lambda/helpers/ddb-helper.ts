import {
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandInput,
    GetCommandOutput,
    PutCommand,
    PutCommandInput,
    PutCommandOutput, TransactWriteCommand, TransactWriteCommandInput, TransactWriteCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import {FunctionError} from "../errors/function-error";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";


const client = new DynamoDBClient();
const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

export async function getRequestDB(request: GetCommandInput): Promise<GetCommandOutput> {
    const input = new GetCommand(request)
    try {
        return await docClient.send(input);
    } catch (e: any) {
        throw new FunctionError(500, e.message);
    }
}

export async function getItemRequestDB(request: GetCommandInput): Promise<GetCommandOutput> {
    const input = new GetCommand(request);
    try {
        return await docClient.send(input);
    } catch (e: any) {
        throw new FunctionError(500, e.message);
    }
}

export async function putRequestDB(request: PutCommandInput): Promise<PutCommandOutput> {
    const input = new PutCommand(request)
    try {
        return await docClient.send(input);
    } catch (e: any) {
        throw new FunctionError(500, e.message);
    }
}

export async function transactRequestDB(request: TransactWriteCommandInput): Promise<TransactWriteCommandOutput> {

    const input = new TransactWriteCommand(request);
    try {
        const answer: TransactWriteCommandOutput = await docClient.send(input);
        return answer;
    } catch (e: any) {
        throw new FunctionError(500, e.message);
    }
}