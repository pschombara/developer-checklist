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

        this.values = {
            name: {
                type: 'text',
                selectorSuffix: 'Name',
            },
            enabled: {
                type: 'checkbox',
                selectorSuffix: 'Enabled',
            },
            icon: {
                type: 'select',
                selectorSuffix: 'Icon',
            },
            successRequiredAll: {
                type: 'checkbox',
                selectorSuffix: 'SuccessRequiredAll'
            }
        };
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

        Object.keys(this.values).forEach((name) => {
            let valueItem = item.querySelector(`#checklist${number}${this.values[name].selectorSuffix}`);

            if ('text' === this.values[name].type) {
                valueItem.value = checklist[name];

                if ('name' === name && '' !== checklist[name]) {
                    this.tabs[number].innerHTML = checklist[name];
                }
            } else if ('checkbox' === this.values[name].type && true === checklist[name]) {
                valueItem.checked = true;
            }
        });

        this.container[number].appendChild(item);
    }

    save() {
        return [];
    }
}
