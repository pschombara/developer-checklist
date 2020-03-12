import {uuidv4} from '../options';

export class DragDrop {
    constructor(item) {
        this.item = item;
        this.item.setAttribute('data-id', uuidv4());
    }

    init() {
        this.item.addEventListener('drop', (e) => {
            e.preventDefault();

            let x = e.clientX;
            let y = e.clientY;

            let container = e.target.closest('[data-draggable]');
            let moved = document.querySelector(`[data-id="${e.dataTransfer.getData('text/plain')}"]`);
            let swapItem = null === document.elementFromPoint(x, y) ? moved : document.elementFromPoint(x, y);


            if (false === swapItem.hasAttribute('draggable')) {
                swapItem = swapItem.closest('[draggable]')
            }

            if (null !== swapItem && container === swapItem.parentNode) {
                swapItem = swapItem !== moved.nextSibling ? swapItem : swapItem.nextSibling;
                container.insertBefore(moved, swapItem);
            }
        });

        this.item.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.item.addEventListener('dragstart', (e) => {
            e.dataTransfer.clearData();
            e.dataTransfer.setData('text/plain', e.target.closest('[draggable]').getAttribute('data-id'));
        });
    }
}
