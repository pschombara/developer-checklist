import {DragDrop} from "./drag-drop";
import {Uuid} from "./uuid";

export class CheatSheet {
    constructor() {
        this._template = document.querySelector('[data-template="cheatSheet"]');
        this._target = document.querySelector('[data-cheat-sheet]');
        this._add = document.querySelector('[data-add-cheat-sheet]');
    }

    init() {
        this._add.addEventListener('click', () => {
            this.create();
        });
    }

    create(label = '', command = '') {
        let elem = document.createElement('div');
        elem.innerHTML = this._template.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%uuidCheatSheet%', 'g'), Uuid.generate());
        let item = elem.children[0];

        item.querySelector('[name="cheatSheetLabel[]"]').value = 'string' === typeof label ? label : '';
        item.querySelector('[name="cheatSheetCommand[]"]').value = 'string' === typeof command ? command : '';

        this._target.appendChild(item);

        new DragDrop(item).init();
    }

    save() {
        let cheatSheet = [];

        let cheatSheetLabel = document.querySelectorAll('[name="cheatSheetLabel[]"]');
        let cheatSheetCommand = document.querySelectorAll('[name="cheatSheetCommand[]"]');
        let cheatSheetDelete = document.querySelectorAll('[name="cheatSheetDelete[]"]');

        for (let key in cheatSheetLabel) {
            if (cheatSheetLabel.hasOwnProperty(key) && false === cheatSheetDelete[key].checked && '' !== cheatSheetLabel[key].value) {
                cheatSheet.push({
                    label: cheatSheetLabel[key].value,
                    command: cheatSheetCommand[key].value,
                });
            }
        }
        return cheatSheet;
    }
}
