import {TransactWriteCommandInputGenerator} from "../src/to-do-lambda/helpers/TransactWriteCommandInputGenerator";
import {TransactWriteCommandInput} from "@aws-sdk/lib-dynamodb";


// the generator generates the inputs backwards, so the inputs have to be entered the other way around to the expected result

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

const test5result: TransactWriteCommandInput = {
    TransactItems: [
        {
            Delete: {
                TableName: "hey",
                Key: {
                    Id: "1"
                }
            }
        },
        {
            Delete: {
                TableName: "hey",
                Key: {
                    Id: "2"
                }
            }
        },
        {
            Delete: {
                TableName: "hey",
                Key: {
                    Id: "3"
                }
            }
        },
        {
            Delete: {
                TableName: "hey",
                Key: {
                    Id: "4"
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

test("Check chain of several deletes", () => {
    const input: TransactWriteCommandInput | undefined = new TransactWriteCommandInputGenerator()
        .deleteToDoFromToDos("hey", "4")
        .deleteToDoFromToDos("hey", "3")
        .deleteToDoFromToDos("hey", "2")
        .deleteToDoFromToDos("hey", "1")
        .transcatWriteCommandInput
    expect(input).toStrictEqual(test5result);
})