export class SuperModules {
    constructor() {
        this._options = {
            jenkins: false,
            cheatSheet: false,
            chat: false,
            gitLab: false,
        }
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
