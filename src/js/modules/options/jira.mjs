import {SuperJira} from "../super/super.jira";
import {Boards} from './jira/boards';
import {General} from './jira/general';
import {Checklists} from './jira/checklists';

export class Jira extends SuperJira {
    constructor() {
        super();

        this._boards = new Boards();
        this._general = new General();
        this._checklists = new Checklists();
    }

    init() {
        this._boards.init(this.options.boards);
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
    }

    save() {
        let jira = {
            boards: this._boards.save(),
        };
        let inputOptions = document.querySelectorAll('[name="option[]"]');

        for (let option of inputOptions) {
            if ('number' === option.getAttribute('type')) {
                this.options[option.getAttribute('data-option')] = parseInt(option.value);
            } else {
                this.options[option.getAttribute('data-option')] = option.value;
            }
        }

        // this.options.boards = [];
        //
        // let boardId = document.querySelectorAll('[name="boardId[]"]');
        // let boardKey = document.querySelectorAll('[name="boardKey[]"]');
        // let boardDelete = document.querySelectorAll('[name="boardDelete[]"]');
        //
        // for (let key in boardKey) {
        //     if (boardKey.hasOwnProperty(key) && false === boardDelete[key].checked) {
        //         this.options.boards.push({
        //             id: parseInt(boardId[key].value),
        //             key: boardKey[key].value
        //         });
        //     }
        // }

        return this.options;
    }
}
