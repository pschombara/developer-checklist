import {SuperChat} from '../../super/super.chat.mjs';

export class Rocket extends SuperChat{
    constructor() {
        super();

        this._name = 'Rocket Chat';

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
            userId: ''
        };
    }
}
