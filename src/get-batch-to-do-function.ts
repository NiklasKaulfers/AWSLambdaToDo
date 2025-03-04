import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {
    DynamoDBClient, ScanCommand, ScanInput, ScanOutput
} from "@aws-sdk/client-dynamodb";


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient();

    const scanInput: ScanInput = {
        TableName: "ToDos",
        AttributesToGet: ["Id", "title", "description", "isCompleted", "inLists"]
    }
    const scanOutput: ScanOutput = await client.send(new ScanCommand(scanInput));
    if (!scanOutput) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: `Nothing found.`}),
        }
    } else {
        return {
            statusCode: 200,
            body: JSON.stringify(scanOutput.Items)
        }
    }
}
