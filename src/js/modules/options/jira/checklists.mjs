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

        this.
    }

    init(checklists) {
        let count = 0;

        for (let checklist of checklists) {
            this.fillChecklist(checklist, count);

            if (++count >= 5) {
                return;
            }
        }
    }

    fillChecklist(checklist, number) {
        const element = document.createElement('div');

        element.innerHTML = this.template.innerHTML;
        element.innerHTML = element.innerHTML.replace(new RegExp('%clNumber%', 'g'), number.toString())

        const item = element.children[0];


        const elements = this.buildValues(checklist, `checklist[${number}]`, this.structure);

        Object.keys(elements).forEach((key) => {
            let input = item.querySelector(`[name="${elements[key].path}"]`);

            if ('checkbox' === elements[key].type) {
                input.checked = elements[key].value;
            } else {
                input.value = elements[key].value;

                if (input.hasAttribute('data-checklist-name') && '' !== input.value) {
                    this.tabs[number].innerHTML = input.value;
                }
            }
        });

        this.container[number].appendChild(item);
    }

    buildValues(checklist, path, structure) {
        let result = [];

        if ('object' !== typeof checklist) {
            return {
                type: structure,
                value: checklist,
                path: path,
            }
        }

        Object.keys(checklist).forEach((key) => {
            if (false === structure.hasOwnProperty(key)) {
                return;
                //throw new Error('Unknown structure!');
            }

            let temp = this.buildValues(checklist[key], path + `[${key}]`, structure[key]);

            if (Array.isArray(temp)) {
                result.push(...temp);
            } else {
                result.push(temp);
            }
        });

        return result;
    }

    save() {
        return [];
    }
}
