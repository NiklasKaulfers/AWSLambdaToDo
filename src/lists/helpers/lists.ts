export class Lists {
    private readonly _list: string;
    private readonly _name: string;
    private readonly _toDos: Set<string>;

    constructor(list: string, name: string, todos: Set<string>) {
        this._list = list;
        this._name = name;
        this._toDos = todos;
    }

    get list() {
        return this._list;
    }

    get name() {
        return this._name;
    }

    get toDos() {
        return this._toDos;
    }

    dto() {
        return {
            id:  this._list,
            name: this._name,
            ToDos:  this._toDos
        }
    }
}
