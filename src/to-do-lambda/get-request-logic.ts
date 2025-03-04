import {verify} from "./helpers/helpers";
import {GetItemCommandOutput} from "@aws-sdk/client-dynamodb";
import {APIGatewayProxyEventPathParameters, APIGatewayProxyResultV2} from "aws-lambda";
import {getRequestDB} from "./helpers/ddb-helper";
import {FunctionError} from "./errors/function-error";
import {GetCommandInput} from "@aws-sdk/lib-dynamodb";

export const getRequestLogic
    = async (pathParameters?: APIGatewayProxyEventPathParameters): Promise<APIGatewayProxyResultV2> => {

    const test: FunctionError | undefined = verifyPath(pathParameters);
    if(test instanceof FunctionError) throw test
    // checked with verify -> have to exist
    const requestAnswer: GetItemCommandOutput = await sendRequest(pathParameters!.id!)
    return {
        statusCode: 200,
        body: JSON.stringify(requestAnswer.Item)
    }
}

const verifyPath = (pathParameters?: APIGatewayProxyEventPathParameters): FunctionError | undefined => {
    try {
        verify({
            param: pathParameters,
            statusCode: 404,
            message: "Path parameters are missing."
        });
        verify({
            param: pathParameters?.id,
            statusCode: 404,
            message: "Id in path missing"
        })
    } catch (e){
        if (e instanceof FunctionError){
            return e;
        }
        throw new FunctionError(500, "Internal Server Error.")
    }
}

const sendRequest = async (id: string) => {
    const getInput: GetCommandInput = {
        TableName: "ToDos",
        Key: {
            Id: id
        }
    };
    return await getRequestDB(getInput);
}