import {DragDrop} from "./drag-drop";
import {Uuid} from "./uuid";
import {SuperJira} from "../super/super.jira";

export class Jira extends SuperJira{
    constructor() {
        super();

        this._template = {
            boards: document.querySelector('[data-template="board"]'),
        };

        this._container = {
            boards: document.querySelector('[data-boards]'),
        };

        this._btn = {
            addBoard: document.querySelector('[data-add-board]'),
        };

        this._comments = document.querySelectorAll('[data-jira-comment]');
    }

    init() {
        Object.keys(this.options).forEach((key) => {
            if ('boards' === key) {
                for (let board of this.options.boards) {
                    this.createBoard(board.id, board.key);
                }
            } else {
                let input = document.querySelector(`[data-option="${key}"]`);

                if (null !== input) {
                    input.value = this.options[key];
                }
            }
        });

        for (let comment of this._comments) {
            if (this.options.comments.hasOwnProperty(comment.getAttribute('data-jira-comment'))) {
                comment.value = this.options.comments[comment.getAttribute('data-jira-comment')];

                comment.addEventListener('change', () => {
                    this.options.comments[comment.getAttribute('data-jira-comment')] = comment.value;
                });
            }
        }

        this._btn.addBoard.addEventListener('click', () => { this.createBoard() });
    }

    createBoard(id = null, key = '') {
        let elem = document.createElement('div');

        elem.innerHTML = this._template.boards.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%boardUuid%', 'g'), Uuid.generate());

        let item = elem.children[0];

        item.querySelector('[name="boardId[]"]').value = 'number' === typeof id ? id : null;
        item.querySelector('[name="boardKey[]"]').value = key;

        this._container.boards.appendChild(item);

        new DragDrop(item).init();
    }

    save() {
        let inputOptions = document.querySelectorAll('[name="option[]"]');

        for (let option of inputOptions) {
            if ('number' === option.getAttribute('type')) {
                this.options[option.getAttribute('data-option')] = parseInt(option.value);
            } else {
                this.options[option.getAttribute('data-option')] = option.value;
            }
        }

        this.options.boards = [];

        let boardId = document.querySelectorAll('[name="boardId[]"]');
        let boardKey = document.querySelectorAll('[name="boardKey[]"]');
        let boardDelete = document.querySelectorAll('[name="boardDelete[]"]');

        for (let key in boardKey) {
            if (boardKey.hasOwnProperty(key) && false === boardDelete[key].checked) {
                this.options.boards.push({
                    id: parseInt(boardId[key].value),
                    key: boardKey[key].value
                });
            }
        }

        return this.options;
    }
}
