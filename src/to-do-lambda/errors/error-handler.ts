import {APIGatewayProxyResultV2} from "aws-lambda";
import {FunctionError} from "./function-error";

export const errorHandler = (e: any): APIGatewayProxyResultV2 =>{
    if (e instanceof FunctionError) {
        return {
            statusCode: e.statusCode,
            body: JSON.stringify(e.message)
        }
    }
    return {
        statusCode: 500,
        body: JSON.stringify({error: e.message})
    }
}