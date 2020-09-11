import _ from 'lodash-es';
import Select from '../../extension/select';

export class Checklists {
    constructor() {
        this.template = document.querySelector('[data-template="jira-checklist"]');

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
                //throw new Error('Unknown structure!');
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
