export class SuperChat {
    constructor(name, identifier) {
        this._options = {
            rooms: {},
            messages: {},
            enabled: false,
        }

        this._name = name;
        this._identifier = identifier;
    }
}
