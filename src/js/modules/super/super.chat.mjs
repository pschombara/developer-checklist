export class SuperChat {
    constructor(name, identifier) {
        this._options = {
            rooms: {},
            messages: {},
            enabled: false,
        }

        this._name = name;
        this._identifier = identifier;
        this._content = document.querySelector(`[data-chat="${this._identifier}"]`);
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

    changeVisibility(identifier) {
        if (identifier === this._identifier) {
            this._content.classList.remove('d-none');
        } else {
            this._content.classList.add('d-none');
        }
    }

    init() {
    }
}
