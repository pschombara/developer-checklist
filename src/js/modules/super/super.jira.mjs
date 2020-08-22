export class SuperJira {
    constructor() {
        this._options = {
            url: '',
            cleanup: 2,
            maximumIssues: 6,
            boards: [],
            checklists: [],
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
