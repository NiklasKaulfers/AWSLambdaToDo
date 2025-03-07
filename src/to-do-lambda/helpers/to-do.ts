export interface ToDoInput {
    toDoId: string,
    title: string,
    description?: string,
    isCompleted?: boolean,
    inLists?: string[]
}

export interface ToDoComparable{
    title?: string,
    description?: string,
    isCompleted?: boolean
}

export class ToDo{
    private readonly _toDoId: string; // Primary Key
    private readonly _isCompleted: boolean;
    private readonly _title: string;
    private readonly _description: string;
    private readonly _inLists: Set<string>;

    constructor({toDoId, isCompleted, title, inLists, description}: ToDoInput) {
        this._toDoId = toDoId;
        this._isCompleted = isCompleted ?? false;
        this._title = title;
        this._description = description ?? "";
        this._inLists = new Set<string>(inLists);
    }

    get id(): string {
        return this._toDoId;
    }

    get isCompleted(): boolean {
        return this._isCompleted;
    }

    get description(): string {
        return this._description;
    }

    get title(): string {
        return this._title;
    }

    dto() {
        if (this._inLists.size > 0) {
            return {
                Id: this._toDoId,
                title: this._title,
                description: this._description,
                isCompleted: this._isCompleted,
                inLists: this._inLists
            };
        }
        return {
            Id: this._toDoId,
            title: this._title,
            description: this._description,
            isCompleted: this._isCompleted
        }
    }

    compare(comparable: ToDoComparable): ToDo{
        if (this._inLists.size > 0){
            return new ToDo({
                toDoId: this._toDoId,
                title: comparable.title ?? this._title,
                description: comparable.description ?? this._description,
                isCompleted: comparable.isCompleted ?? this._isCompleted,
                inLists: Array.from(this._inLists)
            })
        }
        return new ToDo({
            toDoId: this._toDoId,
            title: comparable.title ?? this._title,
            description: comparable.description ?? this._description,
            isCompleted: comparable.isCompleted ?? this._isCompleted
        })

    }
}