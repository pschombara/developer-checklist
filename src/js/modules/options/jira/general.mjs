export class General {
    constructor() {
        this._inputs = {
            url: document.querySelector('#jiraUrl'),
            maximumIssues: document.querySelector('#jiraMaximumIssues'),
            cleanup: document.querySelector('#jiraCleanup'),
        };

        this.types = {
            url: 'string',
            maximumIssues: 'number',
            cleanup: 'number',
        }

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
            if ('number' === this.types[key]) {
                general[key] = parseInt(this._inputs[key].value);
            } else {
                general[key] = this._inputs[key].value;
            }
        }

        return general;
    }
}
