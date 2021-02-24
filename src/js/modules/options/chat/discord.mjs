import {SuperChat} from '../../super/super.chat.mjs';

export class Discord extends SuperChat {
    constructor() {
        super();

        this._name = 'Discord';
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
