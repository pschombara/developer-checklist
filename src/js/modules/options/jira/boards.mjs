import {Uuid} from '../uuid';
import {DragDrop} from '../drag-drop';

export class Boards {
    constructor() {
        this._template = document.querySelector('[data-template="board"]');
        this._container = document.querySelector('[data-boards]');
        this._add = document.querySelector('[data-add-board]');
    }

    init(boards) {
        for (let board of boards) {
            this.create(board.id, board.key);
        }

        this._add.addEventListener('click', () => {
            this.create();
        });
    }

    create(id = null, key = '') {
        const elem = document.createElement('div');

        elem.innerHTML = this._template.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%boardUuid%', 'g'), Uuid.generate());

        const item = elem.children[0];

        item.querySelector('[name="boardId[]"]').value = 'number' === typeof id ? id : null;
        item.querySelector('[name="boardKey[]"]').value = key;

        this._container.appendChild(item);

        new DragDrop(item).init();
    }

    save() {
        let boards = [];

        // todo
        return boards;
    }
}
