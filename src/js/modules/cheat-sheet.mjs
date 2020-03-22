import {Toast} from "./sweet.mjs";

let copyCheatSheet = document.querySelector('[data-copy="cheat-sheet"]');
let labels = document.querySelector('[data-cheat-sheet-labels]');
let command = document.querySelector('[data-cheat-sheet-command]');
let labelInput = document.querySelector('[list="cheatSheetList"]');

const createCommand = () => {
    let selected = document.querySelector(`#cheatSheetList option[value="${labelInput.value}"]`);

    if (null === selected) {
        command.value = '';
    } else {
        command.value = selected.getAttribute('data-command');
    }
};

export function init(commands) {
    for (let item of commands) {
        let option = document.createElement('option');
        option.value = item.label;
        option.setAttribute('data-command', item.command);
        labels.appendChild(option);
    }

    labelInput.addEventListener('click', () => {
        labelInput.value = '';
    });

    labelInput.addEventListener('change', createCommand);
    command.addEventListener('change', createCommand);
    command.addEventListener('keyup', createCommand);

    command.addEventListener('click', copy);
    copyCheatSheet.addEventListener('click', copy);
}

const copy = () => {
    if ('' === command.value) {
        Toast.fire({
            icon: "error",
            title: "First select a cheat.",
            position: "bottom"
        });

        return;
    }

    command.select();
    document.execCommand('copy');
    window.getSelection().removeAllRanges();

    Toast.fire({
        icon: "success",
        title: "Copied to clipboard",
        position: "bottom"
    });
};
