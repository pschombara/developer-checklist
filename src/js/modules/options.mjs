import * as storage from './storage.mjs';
import * as config from './options/config.mjs';
import * as jenkins from './options/jenkins.mjs';
import * as jira from './options/jira.mjs';
import './jquery.mjs';
import 'bootstrap';

import {Validator} from "./options/validator";
import {ConfirmationPrompt, SuccessPrompt} from "./sweet";
import {OptionsRocketChat} from "./options/rocket.chat";
import {Uuid} from "./options/uuid";

// todo replace with options
const listTypes = ['developer', 'tester', 'reviewer', 'help'];

const addJenkins = document.querySelector('[data-add-jenkins]');
const addBoard = document.querySelector('[data-add-board]');

const btnRestoreOptions = document.querySelector('[data-default="btn"]');
const btnUpload = document.querySelector('[data-upload="btn"]');
const fileUpload = document.querySelector('[data-upload="file"]');

const templateCardList = document.querySelector('[data-template="cardList"]');
const templateListEntry = document.querySelector('[data-template="listEntry"]');
export const validator = new Validator();

let rocketChat = new OptionsRocketChat();

let options = {};

const createCardList = (id, title, items, type) => {
    let temp = templateCardList.innerHTML;
    let cardList = document.querySelector(`[data-accordion="${type}"]`);

    temp = temp.replace(new RegExp('%number%', 'g'), id);
    temp = temp.replace('%name%', title);
    temp = temp.replace(new RegExp('%type%', 'g'), type);

    let elem = document.createElement('div');
    elem.innerHTML = temp;

    cardList.appendChild(elem.children[0]);

    createListEntries(id, items, type);

    let addBtn = document.querySelector(`[data-type="${type}"][data-add="${id}"]`);
    addBtn.addEventListener('click', () => {
        createListEntry(document.querySelector(`[data-type="${addBtn.getAttribute('data-type')}"][data-items="${id}"]`), {text: '', id: Uuid.generate()}, id);
    });
};

const createListEntries = (id, items, type) => {
    let target = document.querySelector(`[data-type="${type}"][data-items="${id}"]`);

    for (let item of items) {
        createListEntry(target, item, id);
    }
};

const createListEntry = (target, item, id) => {
    let temp = templateListEntry.innerHTML;

    temp = temp.replace(new RegExp('%number%', 'g'), id);
    temp = temp.replace(new RegExp('%identifier%', 'g'), item.id);

    let elem = document.createElement('div');
    elem.innerHTML = temp;
    elem.children[0].querySelector('input').value = item.text;

    target.appendChild(elem.children[0]);
};

const create = () => {
    Object.keys(options).map((key) => {

        let input = document.querySelector(`[data-option="${key}"]`);

        if (null !== input) {
            input.value = options[key];
        }
    });

    if (options.hasOwnProperty('jenkins')) {
        for (let item of options.jenkins) {
            jenkins.create(item.name, item.job, item.type);
        }
    }

    if (options.hasOwnProperty('boards')) {
        for (let item of options.boards) {
            jira.createBoard(item.id, item.key);
        }
    }

    if (options.hasOwnProperty('rocketChat')) {
        rocketChat.options = options.rocketChat;
    }

    // need user action to request permission
    document.querySelector('#rocket-chat-tab').addEventListener('click', () => {
        rocketChat.init();
    });

    for (let type of listTypes) {
        for (let entry of options.lists[type]) {
            createCardList(entry.id, entry.title, entry.items, type);
        }
    }

    $('[data-toggle="collapse"]').collapse();
};

const saveInputOptions = () => {
    let inputOptions = document.querySelectorAll('[name="option[]"]');

    for (let option of inputOptions) {
        if ('number' === option.getAttribute('type')) {
            options[option.getAttribute('data-option')] = parseInt(option.value);
        } else {
            options[option.getAttribute('data-option')] = option.value;
        }
    }
};


export function init() {
    storage.loadOptions().then(stored => {
        if (0 === Object.keys(stored).length) {
            config.restore().then(stored => {
                options = stored;
                storage.write('options', stored);
                create();
            });
        } else {
            options = stored;
            create();
        }
    });

    addJenkins.addEventListener('click', jenkins.create);
    addBoard.addEventListener('click', jira.createBoard);

    btnRestoreOptions.addEventListener('click', () => {
        ConfirmationPrompt.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            confirmButtonText: 'Yes, restore it!',
        }).then((result) => {
            if (result.value) {
                config.restore().then(options => {
                    storage.write('options', options);

                    SuccessPrompt.fire({
                        title: 'Restored!',
                        text: 'Your options have been restored.',
                        onClose: () => {
                            location.reload();
                        },
                    })
                });
            }
        });
    });
    btnUpload.addEventListener('click', () => {
        fileUpload.click();
    });

    fileUpload.addEventListener('change', config.importFromJson);
}

export function save(type) {
    saveInputOptions();

    options.jenkins = jenkins.save();
    options.boards = jira.save();
    options.rocketChat = rocketChat.options;

    for (let type of listTypes) {
        let items = document.querySelectorAll(`[data-type=${type}][data-items]`);
        let saveLists = {};
        saveLists = options.lists[type];

        for (let item of items) {
            let id = item.getAttribute('data-items');
            let inputs = item.querySelectorAll(`[data-item="${id}"]`);
            let deletes = item.querySelectorAll(`[data-delete="${id}"]`);
            let identifiers = item.querySelectorAll(`[data-identifier="${id}"]`);

            saveLists[id - 1].items = [];

            for (let key in inputs) {
                if (false === deletes[key].checked) {
                    saveLists[id - 1].items.push({
                        text: inputs[key].value,
                        checked: false,
                        id: identifiers[key].value
                    });
                }
            }

            options.lists[type] = saveLists;
        }
    }

    if (false === validator.validate(options)) {
        return false;
    }

    storage.write('options', options);

    if ('export' === type) {
        config.exportToJson();
    }

    return true;
}
