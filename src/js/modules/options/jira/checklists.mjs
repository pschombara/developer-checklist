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
            0: document.querySelector('#jira-checklist-0-tab'),
            1: document.querySelector('#jira-checklist-1-tab'),
            2: document.querySelector('#jira-checklist-2-tab'),
            3: document.querySelector('#jira-checklist-3-tab'),
            4: document.querySelector('#jira-checklist-4-tab'),
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
    }

    init(checklists) {
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
        const categoryAdd = item.querySelector('[data-add]');

        categoryAdd.addEventListener('click', () => {
            itemChecklist.append(this.createCategory(number));
        });

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

                if (input.hasAttribute('data-checklist-name')) {
                    let name = this.tabs[number].querySelector('[data-name]');

                    if ('' !== input.value) {
                        name.innerHTML = input.value;
                    }

                    input.addEventListener('blur', () => {
                        name.innerHTML = '' !== input.value ? input.value : `Checklist ${number}`
                    })
                }

                if (input.hasAttribute('data-checklist-icon')) {
                    let icon = this.tabs[number].querySelector('[data-icon]');
                    if ('' !== input.value) {
                        icon.classList.remove(...icon.classList);
                        icon.classList.add(...(input.value.split(' ')));
                    }

                    input.addEventListener('change', () => {
                        if ('' !== input.value) {
                            icon.classList.remove(...icon.classList);
                            icon.classList.add(...(input.value.split(' ')));
                        } else {
                            icon.classList.remove(...icon.classList);
                            icon.classList.add('d-none');
                        }
                    });
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

        uid = '' !== uid ? uid : Uuid.generate();

        categoryElement.innerHTML = this.templateCategory.innerHTML;
        categoryElement.innerHTML = categoryElement.innerHTML.replace(new RegExp('%clNumber%', 'g'), number);
        categoryElement.innerHTML = categoryElement.innerHTML.replace(new RegExp('%clcUuid%', 'g'), uid);

        const categoryItem = categoryElement.children[0];
        const itemAdd = categoryItem.querySelector('[data-add]');
        const containerItems = categoryItem.querySelector('[data-checklist-items]');

        categoryItem.querySelector('input').value = title;

        itemAdd.addEventListener('click', () => {
            const newItem = this.createItem(number, uid);
            containerItems.append(newItem);
            new DragDrop(newItem).init();
        });

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

    fillValues(formData, number) {
        let checklist = {};

        Object.keys(this.elements[number]).forEach(key => {
            if ('checkbox' === this.elements[number][key].type) {
                _.set(checklist, this.elements[number][key].key, formData.has(this.elements[number][key].path));
            } else {
                _.set(checklist, this.elements[number][key].key, formData.get(this.elements[number][key].path))
            }
        });

        const deleteItems = formData.getAll('jenkins-item-delete[]');
        const deleteCategories = formData.getAll('jenkins-category-delete[]');

        const categories = formData.getAll(`checklist[${number}][checklist][title][]`);
        const categoryUuids = formData.getAll(`checklist[${number}][checklist][uid][]`);

        let cl = [];

        for (let key in categories) {
            if (undefined === categoryUuids[key] || deleteCategories.includes(categoryUuids[key])) {
                continue;
            }

            let items = [];

            const itemText = formData.getAll(`checklist[${number}][checklist][${categoryUuids[key]}][text][]`);
            const itemIds = formData.getAll(`checklist[${number}][checklist][${categoryUuids[key]}][id][]`);

            for (let innerKey in itemText) {
                if (undefined === itemIds[innerKey] || deleteItems.includes(itemIds[innerKey])) {
                    continue;
                }

                items.push({
                    text: itemText[innerKey],
                    id: itemIds[innerKey],
                });
            }

            cl.push({
                title: categories[key],
                uid: categoryUuids[key],
                items: items,
            });
        }

        checklist.checklist = cl;

        return checklist;
    }

    save() {
        const formData = new FormData(this.form);
        let checklists = {};

        for (let i = 0; i < 5; ++i) {
            checklists[i] = this.fillValues(formData, i);
        }

        return checklists;
    }
}
