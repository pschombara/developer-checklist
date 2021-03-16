import {SuperChat} from '../../super/super.chat.mjs';

export class Google extends SuperChat {
    constructor() {
        super('Google Chat', 'google');
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
