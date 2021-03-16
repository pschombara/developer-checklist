import {SuperChat} from '../../super/super.chat.mjs';

export class Discord extends SuperChat {
    constructor() {
        super('Discord', 'discord');
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
