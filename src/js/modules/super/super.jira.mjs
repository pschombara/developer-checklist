export class SuperJira {
    constructor() {
        this._options = {
            url: '',
            cleanup: 2,
            maximumIssues: 6,
            boards: [],
            comments: {
                "developer-success": "h4. {color:#1e872b}Checklist{color}: All checked and done! (/)",
                "tester-success": "h4. Test {color:#1e872b}OK{color} (/)",
                "tester-failed": "h4. Test {color:#de350b}failed{color} (x)",
                "reviewer-success": "h4. Review {color:#1e872b}OK{color} (/)",
                "reviewer-failed": "h4. Review {color:#de350b}failed{color} (x)"
            }
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
