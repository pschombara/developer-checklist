import {Google} from './chat/google.mjs';
import {Rocket} from './chat/rocket.mjs';
import {Discord} from './chat/discord.mjs';

export class Chat {
    constructor() {
        this._chats = {
            google: new Google(),
            rocket: new Rocket(),
            discord: new Discord(),
        }
    }

    set options (options) {
        Object.keys(options).forEach(key => {
            if (this._chats.hasOwnProperty(key)) {
                this._chats[key].options = options[key];
            }
        });
    }

    save() {
        let options = {};

        Object.keys(this._chats).forEach(key => {
            options[key] = this._chats[key].save();
        });

        return options;
    }
}
