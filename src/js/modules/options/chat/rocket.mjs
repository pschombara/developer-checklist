import {SuperChatOptions} from '../../super/super.chat.options.mjs';

export class Rocket extends SuperChatOptions {
    constructor() {
        super('Rocket Chat', 'rocket');

        this._options['url'] = '';
        this._options['authToken'] = '';
        this._options['userId'] = '';
    }

    save() {
        return {
            rooms: {

            },
            messages: {

            },
            url: '',
            authToken: '',
            userId: '',
            enabled: false,
        };
    }
}
