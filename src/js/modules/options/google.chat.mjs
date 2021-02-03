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
        }

        this._content = {
            room: document.querySelector('[data-gc-rooms]')
        }
    }

    init() {
        this._buttons.addRoom.addEventListener('click', () => { this.addRoom() });
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

    createRoom(name, webhookUrl) {
        const elem = document.createElement('div');

        elem.innerHTML = this._templates.room.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcrUuid%', 'g'), Uuid.generate());
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcrName%', 'g'), name);
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcrUrl%', 'g'), webhookUrl);

        this._content.room.append(elem.children[0]);
    }
}
