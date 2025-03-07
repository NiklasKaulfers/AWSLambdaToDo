import {TransactWriteCommandInput} from "@aws-sdk/lib-dynamodb";

export class TransactWriteCommandInputGenerator {
    private readonly _transcatWriteCommandInput: TransactWriteCommandInput | undefined;

    constructor(transactWriteCommandInput?: TransactWriteCommandInput) {
        this._transcatWriteCommandInput = transactWriteCommandInput;
    }

    deleteToDoFromToDos = (toDoTableName: string, toDoId: string): TransactWriteCommandInputGenerator => {
        const deleteInput: TransactWriteCommandInput = {
            TransactItems: [
                {
                    Delete: {
                        TableName: toDoTableName,
                        Key: {
                            Id: toDoId
                        }
                    }
                }
            ]
        }
        if (this._transcatWriteCommandInput) {
            const newArray =
                [deleteInput]
                    .concat(this._transcatWriteCommandInput)
                    .map(transactWriteCommandInput => transactWriteCommandInput.TransactItems || [])
                    .flat()
            const updatedCommand = {
                TransactItems: newArray
            }
            return new TransactWriteCommandInputGenerator(updatedCommand);
        }

        return new TransactWriteCommandInputGenerator(deleteInput);
    }

    deleteReferencesToToDoFromLists = (toDoId: string,listTableName: string, listIdsContainingToDo: string[]): TransactWriteCommandInputGenerator => {
        const transactItems = listIdsContainingToDo
            .map((listIdContainingToDo): TransactWriteCommandInput => {
                return {
                    TransactItems:
                        [{
                            Update: {
                                TableName: listTableName,
                                Key: {
                                    id: listIdContainingToDo
                                },
                                ExpressionAttributeValues: {
                                    ":toDo": new Set(toDoId)
                                },
                                UpdateExpression: "Delete ToDos :toDo",
                            }
                        }]
                }
            })

        if (this._transcatWriteCommandInput) {
            const concatWithStoredValues = transactItems
                .concat(this._transcatWriteCommandInput)
                .map(transactWriteCommandInput => transactWriteCommandInput.TransactItems || [])
                .flat();
            const generateCommandWithStoredVariables = {
                TransactItems: concatWithStoredValues
            }
            return new TransactWriteCommandInputGenerator(generateCommandWithStoredVariables);
        }

        const inputWithoutStoredValues = transactItems
            .map(transactWriteCommandInput => transactWriteCommandInput.TransactItems || [])
            .flat();

        const generateCommandAsInit = {
            TransactItems: inputWithoutStoredValues
        }
        return new TransactWriteCommandInputGenerator(generateCommandAsInit);
    }

    get transcatWriteCommandInput(): TransactWriteCommandInput | undefined {
        return this._transcatWriteCommandInput;
    }
}