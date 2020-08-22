export class General {
    constructor() {
        this._inputs = {
            url: document.querySelector('#jiraUrl'),
            maximumIssues: document.querySelector('#jiraMaximumIssues'),
            cleanup: document.querySelector('#jiraCleanup'),
        };

        this.optionKeys = ['url', 'cleanup', 'maximumIssues'];

    }

    init(options) {
        for (let key of this.optionKeys) {
            if (options.hasOwnProperty(key)) {
                this._inputs[key].value = options[key];
            }
        }
    }

    save() {
        let general = {};

        for (let key of this.optionKeys) {
             general[key] = this._inputs[key].value;
        }

        return general;
    }
}
