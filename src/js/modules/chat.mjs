import {Google} from './chat/google.mjs';

export class Chat {
    constructor() {
        this._chats = {
            google: new Google(),
        }

        this._fields = {
            client: document.querySelector('#chatClient'),
            rooms: document.querySelector('#chatRoomList'),
            messages: document.querySelector('#chatMessageList'),
            boards: document.querySelector('#chatBoardList'),
            issue: document.querySelector('#chatIssue'),
        }

        this._buttons = {
            send: document.querySelector('#chatSend'),
            addIssue: document.querySelector('#chatAddIssue'),
        }

        this._options = {
            chat: {},
            jira: {},
        }
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

    init() {
        this.fillBoards();
    }

    fillBoards() {
        for (let board of this.options.jira.boards) {
            let option = document.createElement('option');
            option.innerHTML = board.key;

            this._fields.boards.appendChild(option);
        }
    }
}
