import {SuperChatOptions} from '../../super/super.chat.options.mjs';

export class Discord extends SuperChatOptions {
    constructor() {
        super('Discord', 'discord');
    }

    save() {
        return {
            rooms: {

            },
            messages: {

            },
            enabled: false,
        };
    }
}
