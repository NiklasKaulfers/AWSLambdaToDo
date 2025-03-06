import {APIGatewayProxyEventPathParameters, APIGatewayProxyResultV2} from "aws-lambda";
import {GetCommandInput, GetCommandOutput, PutCommandInput, PutCommandOutput} from "@aws-sdk/lib-dynamodb";
import {getRequestDB, putRequestDB} from "./helpers/ddb-helper";
import {FunctionError} from "./errors/function-error";
import {ToDo, ToDoComparable, ToDoInput} from "./helpers/to-do";

const TODO_TABLE_NAME = process.env.TODO_TABLE_NAME;

export const updateExistingToDo
    = async (pathParameters?: APIGatewayProxyEventPathParameters, body?: string): Promise<APIGatewayProxyResultV2> => {


    const id: string = verifyPathParameters(pathParameters);
    const toDoComparable: ToDoComparable = verifyBodyAsToDoComparable(body);


    const valuesStoredInDB: Record<string, any> = await getStateOfToDoStoredInDB(id);
    const storedToDo: ToDo = generateToDoFromRecord(valuesStoredInDB, id);

    const newToDo: ToDo = storedToDo.compare(toDoComparable);

    const successfulDBWrite: PutCommandOutput = await sendUpdate(newToDo);
    if (!successfulDBWrite) throw new FunctionError(500, "Dynamo DB did not return properly.");
    return {
        statusCode: 200,
        body: JSON.stringify({message: `Successfully updated ${id}`})
    }
}

const verifyPathParameters
    = (pathParameters?: APIGatewayProxyEventPathParameters) => {

    if (!pathParameters) throw new FunctionError(404, "Path parameters are missing.")
    if (!pathParameters.id) throw new FunctionError(404, "Id is missing in Path parameters.")
    return pathParameters.id;
}

const verifyBodyAsToDoComparable = (body?: string): ToDoComparable => {
    if (!body) throw new FunctionError(404, "Body is missing.");
    return JSON.parse(body);
}

const getStateOfToDoStoredInDB = async (toDoId: string) => {
    const getItemInput: GetCommandInput = {
        TableName: TODO_TABLE_NAME,
        Key: {
            Id: toDoId
        }
    };
    const dbReturnValues: GetCommandOutput = await getRequestDB(getItemInput);
    if (!dbReturnValues.Item) throw new FunctionError(404, "DB does not have the item stored.");
    return dbReturnValues.Item;
}


const generateToDoFromRecord = (input: Record<string, any>, toDoId: string): ToDo => {
    const toDoInterface: ToDoInput = {
        toDoId: toDoId,
        inLists: Array.from(input.inLists),
        isCompleted: input.isCompleted,
        title: input.title,
        description: input.description
    }
    return new ToDo(toDoInterface);
}



const sendUpdate = async (toDo: ToDo): Promise<PutCommandOutput> => {
    const input: PutCommandInput = {
        TableName: TODO_TABLE_NAME,
        Item: toDo.dto(),
        ConditionExpression: "attribute_exists(Id)"
    };
    return await putRequestDB(input);
}