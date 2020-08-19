export class SuperModules {
    constructor() {
        this._options = {
            jenkins: true,
            cheatSheet: true,
            rocketChat: true,
            gitLab: true
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
