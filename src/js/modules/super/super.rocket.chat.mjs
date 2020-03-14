export class SuperRocketChat {
    constructor() {
        this._options = {
            url: '',
            authToken: '',
            userId: '',
            internalRoom: '',
            externalRoom: '',
        };
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
}
