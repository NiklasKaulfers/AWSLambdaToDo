import * as CreateNewToDoInDB from "../src/to-do-lambda/create-new-to-do-in-db";
import {ToDo} from "../src/to-do-lambda/helpers/to-do";

const test1result: ToDo = new ToDo({
    title: "title",
    toDoId: "1",
    inLists: ["2", "3"],
    description: "welp",
    isCompleted: true
})

test("Test verification of ToDo for creation", () => {
    const body = JSON.stringify({
        title: "title",
        toDoId: "1",
        inLists: ["2", "3"],
        description: "welp",
        isCompleted: true
    })
    expect(CreateNewToDoInDB.verifyBodyAsToDo(body)).toStrictEqual(test1result);
})