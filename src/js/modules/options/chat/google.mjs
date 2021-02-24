import {SuperChat} from '../../super/super.chat.mjs';

export class Google extends SuperChat{
    constructor() {
        super();

        this._name = 'Google Chat';
    }

    save() {
        return {
            rooms: {

            },
            messages: {

            }
        };
    }
}
