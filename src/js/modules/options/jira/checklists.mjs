import _ from 'lodash-es';
import Select from '../../extension/select';
import {DragDrop} from '../drag-drop';
import {Uuid} from '../uuid';

export class Checklists {
    constructor() {
        this.template = document.querySelector('[data-template="jira-checklist"]');
        this.templateCategory = document.querySelector('[data-template="jira-checklist-category"]');
        this.templateItem = document.querySelector('[data-template="jira-checklist-item"]');

        this.container = {
            0: document.querySelector('#jira-checklist-0'),
            1: document.querySelector('#jira-checklist-1'),
            2: document.querySelector('#jira-checklist-2'),
            3: document.querySelector('#jira-checklist-3'),
            4: document.querySelector('#jira-checklist-4'),
        };

        this.tabs = {
            0: document.querySelector('#checklist-0-tab'),
            1: document.querySelector('#checklist-1-tab'),
            2: document.querySelector('#checklist-2-tab'),
            3: document.querySelector('#checklist-3-tab'),
            4: document.querySelector('#checklist-4-tab'),
        }

        this.structure= {
            enabled: 'checkbox',
            name: 'text',
            icon: 'select',
            successRequiredAll: 'checkbox',
            buttons: {
                success: {
                    text: 'text',
                    enabled: 'checkbox',
                    comment: 'text',
                    autoComment: 'checkbox',
                },
                failed: {
                    text: 'text',
                    enabled: 'checkbox',
                    comment: 'text',
                    autoComment: 'checkbox',
                }
            },
        }

        this.elements = [];

        this.form = document.querySelector('#formJiraChecklist');

        this.defaultChecklist = {
            enabled: false,
            name: '',
            icon: '',
            successRequiredAll: false,
            buttons: {
                success: {
                    text: '',
                    enabled: false,
                    comment: '',
                    autoComment: false
                },
                failed: {
                    text: '',
                    enabled: false,
                    comment: '',
                    autoComment: false
                },
            },
            checklist: {
                0: [],
                1: [],
                2: [],
                3: [],
                4: [],
            }
        };

        // todo remove
        this.checklists = {};
    }

    init(checklists) {
        this.checklists = checklists; // todo remove
        let count = 0;

        Object.values(checklists).forEach(checklist => {
            this.fillChecklist(checklist, count++);
        });
    }

    fillChecklist(checklist, number) {
        const element = document.createElement('div');

        element.innerHTML = this.template.innerHTML;
        element.innerHTML = element.innerHTML.replace(new RegExp('%clNumber%', 'g'), number.toString())

        const item = element.children[0];

        const itemChecklist = item.querySelector('[data-checklist-accordion]');

        for (let category of checklist.checklist) {
            const categoryItem = this.createCategory(number, category.title, category.uid);

            const containerItems = categoryItem.querySelector('[data-checklist-items]');

            for (let cItem of category.items) {
                const itemItem = this.createItem(number, category.uid, cItem.id, cItem.text);

                containerItems.append(itemItem);
                new DragDrop(itemItem).init();
            }

            itemChecklist.appendChild(categoryItem);
        }

        this.elements[number] = this.buildValues(checklist, `checklist[${number}]`, this.structure);

        Object.keys(this.elements[number]).forEach((key) => {
            let input = item.querySelector(`[name="${this.elements[number][key].path}"]`);

            if ('checkbox' === this.elements[number][key].type) {
                input.checked = this.elements[number][key].value;
            } else {
                input.value = this.elements[number][key].value;

                if (input.hasAttribute('data-checklist-name') && '' !== input.value) {
                    this.tabs[number].innerHTML = input.value;
                }
            }

            if (input.hasAttribute('data-select')) {
                new Select(input);
            }
        });

        this.container[number].appendChild(item);
    }

    createCategory(number, title = '', uid = '') {
        const categoryElement = document.createElement('div');
        categoryElement.innerHTML = this.templateCategory.innerHTML;
        categoryElement.innerHTML = categoryElement.innerHTML.replace(new RegExp('%clNumber%', 'g'), number);
        categoryElement.innerHTML = categoryElement.innerHTML.replace(new RegExp('%clcUuid%', 'g'), '' !== uid ? uid : Uuid.generate());

        const categoryItem = categoryElement.children[0];
        categoryItem.querySelector('input').value = title;

        return categoryItem;
    }

    createItem(number, categoryUid, uid = '', text = '') {
        const element = document.createElement('div');
        element.innerHTML = this.templateItem.innerHTML;
        element.innerHTML = element.innerHTML.replace(new RegExp('%clNumber%', 'g'), number);
        element.innerHTML = element.innerHTML.replace(new RegExp('%clcUuid%', 'g'), categoryUid);
        element.innerHTML = element.innerHTML.replace(new RegExp('%cliUuid%', 'g'), '' !== uid ? uid : Uuid.generate());

        const item = element.children[0];
        item.querySelector('input').value = text;

        return item;
    }

    buildValues(checklist, path, structure, keys = []) {
        let result = [];

        if ('object' !== typeof checklist) {
            return {
                type: structure,
                value: checklist,
                path: path,
                key: keys.join('.'),
            }
        }

        Object.keys(checklist).forEach((key) => {
            if (false === structure.hasOwnProperty(key)) {
                return;
            }

            let temp = this.buildValues(checklist[key], path + `[${key}]`, structure[key], [...keys, key]);

            if (Array.isArray(temp)) {
                result.push(...temp);
            } else {
                result.push(temp);
            }
        });

        return result;
    }

    fillValues(checklist, formData, number) {
        Object.keys(this.elements[number]).forEach(key => {
            if (formData.has(this.elements[number][key].path)) {
                if ('checkbox' === this.elements[number][key].type) {
                    _.set(checklist, this.elements[number][key].key, true)
                } else {
                    _.set(checklist, this.elements[number][key].key, formData.get(this.elements[number][key].path))
                }
            }
        });
    }

    save() {
        const formData = new FormData(this.form);
        let checklists = {};

        for (let i = 0; i < 5; ++i) {
            let checklist = Object.assign({}, this.defaultChecklist);

            this.fillValues(checklist, formData, i);

            // todo update lists, remove next line
            checklist.checklist = this.checklists[i].checklists;

            checklists[i] = checklist;
        }

        return this.checklists; // todo remove

        return checklists;
    }
}
