export class SuperChat {
    constructor() {
        this._options = {
            rooms: {},
            messages: {}
        }

        this._name = '';
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
}
