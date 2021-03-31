import {Google} from './chat/google.mjs';
import {Toast} from './sweet';

export class Chat {
    constructor() {
        this._chats = {
            google: new Google(),
        };

        this._content = {
            chat: document.querySelector('[data-chat="content"]'),
            info: document.querySelector('[data-chat="info"]'),
        };

        this._container = {
            issues: document.querySelector('[data-chat-issues]'),
        };

        this._issues = {
            count: document.querySelector('[data-chat-issues-count]'),
        };

        this._templates = {
            issue: document.querySelector('[data-template="chat-issue"]'),
        };

        this._fields = {
            client: document.querySelector('#chatClient'),
            rooms: document.querySelector('#chatRoomList'),
            messages: document.querySelector('#chatMessageList'),
            boards: document.querySelector('#chatBoardList'),
            issue: document.querySelector('#chatIssue'),
        };

        this._list = {
            rooms: document.querySelector('[list=chatRoomList]'),
            messages: document.querySelector('[list=chatMessageList]'),
        };

        this._buttons = {
            send: document.querySelector('#chatSend'),
            addIssue: document.querySelector('#chatAddIssue'),
        };

        this._options = {
            chat: {},
            jira: {},
        };
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

        for (let [chat, options] of Object.entries(this.options.chat)) {
            if (this._chats.hasOwnProperty(chat)) {
                this._chats[chat].options = options;

                if (options.enabled) {
                    let option = document.createElement('option');
                    option.value = chat;
                    option.innerHTML = this._chats[chat].name;

                    this._fields.client.append(option);
                }
            }
        }

        if (0 === this._fields.client.children.length) {
            this._content.chat.classList.add('d-none');
            this._content.info.classList.remove('d-none');

            return;
        }

        this._fields.client.children[0].selected = true;
        this.fillRooms();
        this.fillMessages();

        this._list.messages.addEventListener('change', () => { this.checkSendReady(); });
        this._list.messages.addEventListener('keyup', () => { this.checkSendReady(); });
        this._list.rooms.addEventListener('change', () => { this.checkSendReady(); });
        this._list.rooms.addEventListener('keyup', () => { this.checkSendReady(); });

        this._buttons.send.addEventListener('click', () => { this.sendMessage(); });
        this._buttons.addIssue.addEventListener('click', () => { this.addIssue(); });
    }

    fillRooms() {
        let rooms = this._chats[this._fields.client.value].rooms;

        this.fillContent(rooms, this._fields.rooms);
    }

    fillMessages() {
        let messages = this._chats[this._fields.client.value].messages;

        this.fillContent(messages, this._fields.messages);
    }

    fillContent(data, target) {
        target.innerHTML = '';

        for (let [id, value] of Object.entries(data).sort((a, b) => a[1].order - b[1].order)) {
            let option = document.createElement('option');

            option.value = value.name;
            option.setAttribute('data-id', id);

            target.appendChild(option);
        }
    }

    checkSendReady() {
        let room = this._fields.rooms.querySelector(`option[value="${this._list.rooms.value}"]`);
        let message = this._fields.messages.querySelector(`option[value="${this._list.messages.value}"]`);

        this._buttons.send.disabled = null === room || null === message;
    }

    sendMessage() {
        let btnIcon = this._buttons.send.querySelector('i');

        try {
            let room = this._fields.rooms.querySelector(`option[value="${this._list.rooms.value}"]`);
            let message = this._fields.messages.querySelector(`option[value="${this._list.messages.value}"]`);
            let chat = this._chats[this._fields.client.value];

            this._buttons.send.disabled = true;
            btnIcon.classList.remove('fa-play');
            btnIcon.classList.add('fa-spin', 'fa-spinner');

            chat
                .send(
                    room.getAttribute('data-id'),
                    message.getAttribute('data-id'),
                    this.collectIssues(),
                )
                .then(() => {
                    Toast.fire({
                        icon: 'success',
                        title: 'Message send',
                        position: 'bottom',
                    });

                    this.unlockSendButton(btnIcon);
                })
                .catch((e) => {
                    Toast.fire({
                        icon: 'error',
                        title: 'Error during message transfer',
                        position: 'bottom',
                    });

                    this.unlockSendButton(btnIcon);
                })
            ;
        } catch (e) {
            this.unlockSendButton(btnIcon);
        }
    }

    unlockSendButton(btnIcon) {
        this._buttons.send.disabled = false;
        btnIcon.classList.add('fa-play');
        btnIcon.classList.remove('fa-spin', 'fa-spinner');
    }

    collectIssues() {
        let issues = this._container.issues.querySelectorAll('[data-chat-issue]');
        let links = [];

        for (let issue of issues) {
            links.push({
                text: issue.getAttribute('data-chat-issue'),
                url: `${this.options.jira.url}/browse/${issue.getAttribute('data-chat-issue')}`,
            });
        }

        return links;
    }


    addIssue() {
        let board = this._fields.boards.value;
        let issueNumber = this._fields.issue.value;

        let issue = document.createElement('div');
        issue.innerHTML = this._templates.issue.innerHTML.replace(new RegExp('%issueNumber%', 'g'), `${board}-${issueNumber}`);

        for (let elem of this._container.issues.children) {
            let data = elem.querySelector('[data-chat-issue]');

            if (`${board}-${issueNumber}` === data.getAttribute('data-chat-issue')) {
                return;
            }
        }

        let issueWrapper = issue.children[0];
        this._container.issues.appendChild(issueWrapper);
        this._issues.count.innerHTML = this._container.issues.children.length.toString();

        let delBtn = issueWrapper.querySelector('button');
        delBtn.addEventListener('click', e => { this.removeIssue(e); } );
        this._fields.issue.value = '';
    }

    removeIssue(e) {
        let wrapper = e.target.parentNode;

        this._container.issues.removeChild(wrapper);
        this._issues.count.innerHTML = this._container.issues.children.length.toString();
    }

    fillBoards() {
        for (let board of this.options.jira.boards) {
            let option = document.createElement('option');
            option.innerHTML = board.key;

            this._fields.boards.appendChild(option);
        }
    }

    initIssue(issue) {
        let [board, number] = issue.split('-');

        this._fields.boards.value = board;
        this._fields.issue.value = number;

        this.addIssue();
    }
}
