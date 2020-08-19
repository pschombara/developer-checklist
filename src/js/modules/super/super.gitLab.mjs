export class SuperGitLab {
    constructor() {
        this._options = {
            host: '',
            projects: [],
            categories: []
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
