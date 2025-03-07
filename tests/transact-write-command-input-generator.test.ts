import {TransactWriteCommandInputGenerator} from "../src/to-do-lambda/helpers/TransactWriteCommandInputGenerator";
import {TransactWriteCommandInput} from "@aws-sdk/lib-dynamodb";

const test1result: TransactWriteCommandInput | undefined = undefined;
const test2result: TransactWriteCommandInput | undefined = {
    TransactItems: [
        {
            Delete: {
                TableName: "hey",
                Key: {
                    Id: "1"
                }
            }
        }
    ]
}
const test3result: TransactWriteCommandInput | undefined = {
    TransactItems: [
        {
            Update: {
                TableName: "list",
                Key: {
                    id: "1"
                },
                ExpressionAttributeValues: {
                    ":toDo": new Set("1")
                },
                UpdateExpression: "Delete ToDos :toDo",
            }
        },{
            Update: {
                TableName: "list",
                Key: {
                    id: "2"
                },
                ExpressionAttributeValues: {
                    ":toDo": new Set("1")
                },
                UpdateExpression: "Delete ToDos :toDo",
            }
        },{
            Update: {
                TableName: "list",
                Key: {
                    id: "3"
                },
                ExpressionAttributeValues: {
                    ":toDo": new Set("1")
                },
                UpdateExpression: "Delete ToDos :toDo",
            }
        }
    ]
}
const test4result: TransactWriteCommandInput | undefined = {
    TransactItems: [
        {
            Update: {
                TableName: "list",
                Key: {
                    id: "1"
                },
                ExpressionAttributeValues: {
                    ":toDo": new Set("1")
                },
                UpdateExpression: "Delete ToDos :toDo",
            }
        },{
            Update: {
                TableName: "list",
                Key: {
                    id: "2"
                },
                ExpressionAttributeValues: {
                    ":toDo": new Set("1")
                },
                UpdateExpression: "Delete ToDos :toDo",
            }
        },{
            Update: {
                TableName: "list",
                Key: {
                    id: "3"
                },
                ExpressionAttributeValues: {
                    ":toDo": new Set("1")
                },
                UpdateExpression: "Delete ToDos :toDo",
            }
        }, {
            Delete: {
                TableName: "hey",
                Key: {
                    Id: "1"
                }
            }
        }
    ]
}

test("Check default construct", () => {
    expect((new TransactWriteCommandInputGenerator()
        .transcatWriteCommandInput))
        .toStrictEqual(test1result);
})
test("Check simple creation with 1 delete", () => {
    expect((new TransactWriteCommandInputGenerator()
        .deleteToDoFromToDos("hey", "1")
        .transcatWriteCommandInput))
        .toStrictEqual(test2result);
})
test("Check creation with 3 updates", () => {
    expect((new TransactWriteCommandInputGenerator()
        .deleteReferencesToToDoFromLists("1", "list", ["1", "2", "3"])
        .transcatWriteCommandInput))
        .toStrictEqual(test3result);
})
test("Check mixed up with 3 updates and 1 delete", () => {
    expect((new TransactWriteCommandInputGenerator()
        .deleteToDoFromToDos("hey", "1")
        .deleteReferencesToToDoFromLists("1", "list", ["1", "2", "3"])
        .transcatWriteCommandInput))
        .toStrictEqual(test4result);
})
