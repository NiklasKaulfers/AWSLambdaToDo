import {ToDo, ToDoComparable} from "../src/to-do-lambda/helpers/to-do";

const test1Result = {
    Id: "1",
    title: "Test",
    isCompleted: false,
    description: ""
}
const compareBareBonesResult: ToDo = new ToDo({
    toDoId: "1",
    isCompleted: true,
    title: "Better Test",
    description: "" ,
})

test("ToDo dto barebones", () => {
    expect((new ToDo({toDoId: "1", title: "Test"}).dto())).toStrictEqual(test1Result)
})

test("ToDo compare barebones", () =>{
    const compareBareBoneyComparable: ToDoComparable = {
        title: "Better Test",
        isCompleted: true
    }
    const toDo = new ToDo({
        toDoId: "1",
        title: "Test"
    });
    expect(toDo.compare(compareBareBoneyComparable)).toStrictEqual(compareBareBonesResult)
})