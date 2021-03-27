import {SuperChatOptions} from '../../super/super.chat.options.mjs';
import {Uuid} from '../uuid.mjs';

export class Google extends SuperChatOptions {
    constructor() {
        super('Google Chat', 'google');

        this._buttons = {
            addRoom: document.querySelector('button[data-gc-add="room"]'),
            closeRoom: document.querySelector('button[data-gc-dismiss="room"]'),
            addMessage: document.querySelector('button[data-gc-add="message"]'),
            saveMessage: document.querySelector('button[data-gc-save="message"]'),
            closeMessage: document.querySelector('button[data-gc-dismiss="message"]'),
        }

        this._templates = {
            room: document.querySelector('[data-template="gc-room"]'),
            message: document.querySelector('[data-template="gc-message"]'),
        }

        this._form = {
            room: document.querySelector('#gc-room'),
            data: document.querySelector('#googleChatAccordion'),
            message: document.querySelector('#gc-message'),
        }

        this._container = {
            rooms: document.querySelector('[data-gc-rooms]'),
            messages: document.querySelector('[data-gc-messages]'),
        }

        this._modal = {
            message: document.querySelector('#gc-modal-message'),
        }
    }

    openMessageModal(e) {
        const gc = e.data.gc;
        const saveButton = gc._modal.message.querySelector('[data-gc-save="message"]')
        const addButton = gc._modal.message.querySelector('[data-gc-add="message"]')
        const name = gc._modal.message.querySelector('input[name="name"]');
        const msg = gc._modal.message.querySelector('textarea[name="content"]');
        const identifier = gc._modal.message.querySelector('input[name="identifier"]');
        const trigger = e.relatedTarget;

        if ('new' === trigger.getAttribute('data-message')) {
            saveButton.classList.add('d-none');
            addButton.classList.remove('d-none');
            gc._form.message.reset();
        } else {
            saveButton.classList.remove('d-none');
            addButton.classList.add('d-none');
            identifier.value = trigger.getAttribute('data-message');

            let row = trigger.closest('.row');

            name.value = row.querySelector('input[type=text]').value;
            msg.innerHTML = row.querySelector('input[data-msg-content]').value;
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

    addMessage() {
        if (false === this._form.message.checkValidity()) {
            this._form.message.reportValidity();

            return;
        }

        const formData = new FormData(this._form.message);

        this.createMessage(formData.get('name'), formData.get('content'), formData.get('identifier'));

        this._buttons.closeMessage.click();
    }

    saveMessage() {
        if (false === this._form.message.checkValidity()) {
            this._form.message.reportValidity();

            return;
        }

        const formData = new FormData(this._form.message);
    }

    createRoom(name, webhookUrl, uuid = '') {
        const elem = document.createElement('div');

        elem.innerHTML = this._templates.room.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcrUuid%', 'g'), '' !== uuid ? uuid : Uuid.generate());
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcrName%', 'g'), name);
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcrUrl%', 'g'), webhookUrl);

        this._container.rooms.append(elem.children[0]);
    }

    createMessage(name, content, uuid = '') {
        const elem = document.createElement('div');

        elem.innerHTML = this._templates.message.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcmUuid%', 'g'), '' !== uuid ? uuid : Uuid.generate());
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcmName%', 'g'), name);
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcmContent%', 'g'), content);

        let shorten = content.substr(0, 50);

        if (shorten.length < content.length) {
            shorten += '...';
        }

        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gcmContentShort%', 'g'), shorten);

        this._container.messages.append(elem.children[0]);
    }

    save() {
        let formData = new FormData(this._form.data);

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

        for (let uuid of formData.getAll('gc-message[]')) {
            if (false === formData.has(`gc-message[delete][${uuid}]`)) {
                messages[uuid] = {
                    name: formData.get(`gc-message[name][${uuid}]`),
                    content: formData.get(`gc-message[content][${uuid}]`),
                };
            }
        }

        return {
            rooms: rooms,
            messages: messages,
            enabled: formData.has('enabled')
        };
    }

    init() {
        super.init();

        this._buttons.addRoom.addEventListener('click', () => { this.addRoom() });
        this._buttons.addMessage.addEventListener('click', () => { this.addMessage() });
        this._buttons.saveMessage.addEventListener('click', () => { this.saveMessage() });

        for (let [uuid, room] of Object.entries(this.options.rooms)) {
            this.createRoom(room.name, room.url, uuid);
        }

        for (let [uuid, message] of Object.entries(this.options.messages)) {
            this.createMessage(message.name, message.content, uuid);
        }

        this._form.data.querySelector('[name="enabled"]').checked = this.options.enabled;

        // open message modal
        $(this._modal.message).on('show.bs.modal', {gc: this}, this.openMessageModal);
    }
}
