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

        this._chatClient = document.querySelector('#chatClient');
    }

    set options (options) {
        Object.keys(options).forEach(key => {
            if (this._chats.hasOwnProperty(key)) {
                this._chats[key].options = options[key];
            }
        });
    }

    init() {
        for (let [key, chat] of Object.entries(this._chats)) {
            let option = document.createElement('option');
            option.value = key;
            option.innerHTML = chat.name;

            this._chatClient.appendChild(option);
            chat.init();
        }

        this._chatClient.addEventListener('change', () => {
            for (let chat of Object.values(this._chats)) {
                chat.changeVisibility(this._chatClient.value);
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
