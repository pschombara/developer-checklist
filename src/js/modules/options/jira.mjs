import * as dragDrop from './drag-drop.mjs';

const template = document.querySelector('[data-template="board"]');

export function createBoard(id = null, key = '') {
    let target = document.querySelector('[data-boards]');
    let elem = document.createElement('div');
    elem.innerHTML = template.innerHTML;

    let item = elem.children[0];

    item.querySelector('[name="boardId[]"]').value = 'number' === typeof id ? id : null;
    item.querySelector('[name="boardKey[]"]').value = key;

    target.appendChild(item);

    item.addEventListener('drag', dragDrop.drag);
}

export function save() {
    let boards = [];

    let boardId = document.querySelectorAll('[name="boardId[]"]');
    let boardKey = document.querySelectorAll('[name="boardKey[]"]');
    let boardDelete = document.querySelectorAll('[name="boardDelete[]"]');

    for (let key in boardKey) {
        if (boardKey.hasOwnProperty(key) && false === boardDelete[key].checked) {
            boards.push({
                id: parseInt(boardId[key].value),
                key: boardKey[key].value
            });
        }
    }


    return boards;
}
