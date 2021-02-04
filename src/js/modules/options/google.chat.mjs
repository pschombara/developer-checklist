import {SuperGoogleChat} from '../super/super.google.chat';
import {Uuid} from './uuid.mjs';

export class GoogleChat extends SuperGoogleChat {
    constructor() {
        super();

        this._buttons = {
            addRoom: document.querySelector('button[data-gc-add="room"]'),
            closeRoom: document.querySelector('button[data-gc-dismiss="room"]'),
        }

        this._templates = {
            room: document.querySelector('[data-template="gc-room"]'),
            message: document.querySelector('[data-template="gc-message"]'),
        }

        this._form = {
            room: document.querySelector('#gc-room'),
            rooms: document.querySelector('form[data-gc-rooms]'),
        }

        this._content = {
            room: document.querySelector('[data-gc-rooms]')
        }
    }

    init() {
        this._buttons.addRoom.addEventListener('click', () => { this.addRoom() });


        for (let uuid of Object.keys(this.options.rooms)) {
            let room = this.options.rooms[uuid];

            this.createRoom(room.name, room.url, uuid);
        }
    }

    addRoom() {
        if (false === this._form.room.checkValidity()) {
            this._form.room.reportValidity();

            return;
        }

        const formData = new FormData(this._form.room);

        this.createRoom(formData.get('name'), formData.get('url'));

        this._buttons.closeRoom.click();
    }

    createRoom(name, webhookUrl, uuid = '') {
        const elem = document.createElement('div');

        elem.innerHTML = this._templates.room.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcrUuid%', 'g'), '' !== uuid ? uuid : Uuid.generate());
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcrName%', 'g'), name);
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcrUrl%', 'g'), webhookUrl);

        this._content.room.append(elem.children[0]);
    }

    save() {
        let formData = new FormData(this._form.rooms);

        let rooms = {};
        let messages = {};

        for (let uuid of formData.getAll('gc-room[]')) {
            if (false === formData.has(`gc-room[delete][${uuid}]`)) {
                rooms[uuid] = {
                    name: formData.get(`gc-room[name][${uuid}]`),
                    url: formData.get(`gc-room[url][${uuid}]`),
                };
            }
        }

        return {
            rooms: rooms,
            messages: messages
        };
    }
}
