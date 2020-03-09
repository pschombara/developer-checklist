export function drag(e) {
    let item = e.target;
    let target = item.closest('[data-draggable]');
    let x = e.clientX;
    let y = e.clientY;

    let swapItem = null === document.elementFromPoint(x, y) ? item : document.elementFromPoint(x, y);

    if (false === swapItem.hasAttribute('draggable')) {
        swapItem = swapItem.closest('[draggable]')
    }

    if (null !== swapItem && target === swapItem.parentNode) {
        swapItem = swapItem !== item.nextSibling ? swapItem : swapItem.nextSibling;
        target.insertBefore(item, swapItem);
    }
}
