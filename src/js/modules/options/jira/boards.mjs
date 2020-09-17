import {Uuid} from '../uuid';
import {DragDrop} from '../drag-drop';

export class Boards {
    constructor() {
        this._template = document.querySelector('[data-template="jira-board"]');
        this._container = document.querySelector('[data-boards]');
        this._add = document.querySelector('[data-add-board]');
        this._form = document.querySelector('#formJiraBoards');
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

        item.querySelector('[name="board[id][]"]').value = 'number' === typeof id ? id : null;
        item.querySelector('[name="board[key][]"]').value = key;

        this._container.appendChild(item);

        new DragDrop(item).init();
    }

    save() {
        let boards = [];
        const form = new FormData(this._form);

        const ids = form.getAll('board[id][]');
        const keys = form.getAll('board[key][]');
        const uuids = form.getAll('board[uuid][]');
        const deleteBoards = form.getAll('boardDelete[]');

        for (let i in ids) {
            if (deleteBoards.includes(uuids[i])) {
                continue;
            }

            boards.push({
                id: parseInt(ids[i]),
                key: keys[i],
            });
        }

        return boards;
    }
}
