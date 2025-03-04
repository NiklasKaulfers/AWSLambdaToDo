export interface ToDoFor {

}

export class ToDo{
    private readonly _toDoId: string; // Primary Key
    private readonly _isCompleted: boolean;
    private readonly _title: string;
    private readonly _description: string;
    private readonly _inLists: Set<string>;
    constructor(toDoId: string, isCompleted: boolean, title: string, inLists?: Set<string>,description?: string ) {
        this._toDoId = toDoId;
        this._isCompleted = isCompleted;
        this._title = title;
        this._description = description || "";
        this._inLists = inLists || new Set<string>("1");
    }

    get id(): string {
        return this._toDoId;
    }

    get isCompleted(): boolean {
        return this._isCompleted;
    }

    get description(): string{
        return this._description;
    }
    get title(): string{
        return this._title;
    }

    dto() {
        return {
            Id:  this._toDoId,
            title:  this._title,
            description:this._description,
            isCompleted: this._isCompleted,
            inLists: this._inLists
        }
    }
}