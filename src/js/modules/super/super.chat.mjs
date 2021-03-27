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

    get options() {
        return this._options;
    };

    set options (options) {
        Object.keys(options).forEach((key) => {
            if (this._options.hasOwnProperty(key)) {
                this._options[key] = options[key];
            }
        });
    }

    get name() {
        return this._name;
    }

    get rooms() {
        return this.options.rooms;
    }

    get messages() {
        return this.options.messages;
    }

    room (id) {
        return this.options.rooms[id];
    }

    message (id) {
        return this.options.messages[id];
    }
}
