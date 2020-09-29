import {SuperJira} from "./super/super.jira";

export class Jira extends SuperJira{
    constructor() {
        super();

        this.tabs = {
            0: document.querySelector('#cl0-tab'),
            1: document.querySelector('#cl1-tab'),
            2: document.querySelector('#cl2-tab'),
            3: document.querySelector('#cl3-tab'),
            4: document.querySelector('#cl4-tab'),
        }

        this._checklistContent = {
            0: document.querySelector('#cl0'),
            1: document.querySelector('#cl1'),
            2: document.querySelector('#cl2'),
            3: document.querySelector('#cl3'),
            4: document.querySelector('#cl4'),
        }

        this._templateContent = document.querySelector('[data-template="jira-checklist-content"]');
        this._templateCategory = document.querySelector('[data-template="jira-checklist-category"]');
    }

    createBoards() {
        let target = document.querySelector('[data-select="board"]');

        for (let board of this.options.boards) {
            let option = document.createElement('option');
            option.innerHTML = board.key;

            target.appendChild(option);
        }
    }

    createChecklists(issue) {
        for (let number = 0; number < 5; ++number) {
            const checklist = this.options.checklists[number];

            if (false === checklist.enabled) {
                continue;
            }

            fillTab(checklist, this.tabs[number], number);
            fillContent(checklist, issue, number, this);
        }
    }

    getIssueTitle() {
        //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:

        return new Promise(resolve => {
            chrome.tabs.executeScript({
                code: '(' + receiveTitle + ')()',
            }, (result) => {
                resolve(result[0]);
            });
        });
    }

    createComment(type) {
        let submit = true;
        let testFailed = new RegExp('^\\w+-failed$');

        if (false === this.options.comments.hasOwnProperty(type)) {
            return;
        }

        if (testFailed.test(type)) {
            submit = false;
        }

        //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
        chrome.tabs.executeScript({
            code: '(' + sendComment + ')(' + `"${this.options.comments[type]}", ${submit}` + ')',
        });
    }
}

const receiveTitle = () => {
    return document.querySelector('#summary-val').innerText;
};

const sendComment = (comment, submit) => {
    let commentBtn = document.querySelector('#footer-comment-button');

    commentBtn.click();
    let text = document.querySelector('#comment');
    text.value = comment;

    if (submit) {
        let send = document.querySelector('#issue-comment-add-submit');
        send.removeAttribute("disabled");
        send.click();
    }

    return true;
};

const fillTab = (checklist, tab, number) => {
    const name = '' !== checklist.name ? checklist.name : `Checklist ${number}`

    tab.parentNode.setAttribute('data-content', name);

    if ('' !== checklist.icon) {
        const icon = document.createElement('i');
        icon.classList.add(...(checklist.icon.split(' ')));
        tab.appendChild(icon);
    } else {
        tab.innerHTML = name[0];
    }

    tab.parentNode.classList.remove('d-none');
}

const fillContent = (checklist, issue, number, instance) => {
    const element = document.createElement('div');
    element.innerHTML = instance._templateContent.innerHTML;
    element.innerHTML = element.innerHTML.replace(new RegExp('%number%', 'g'), number);

    const content = element.children[0];

    const buttonSuccess = content.querySelector('button[data-btn="success"]');
    const buttonFailed = content.querySelector('button[data-btn="failed"]');
    const buttonClear = content.querySelector('button[data-btn="clear"]');
    const categoryTarget = content.querySelector('[data-list]');

    if (false === checklist.buttons.success.enabled) {
        buttonSuccess.classList.add('d-none');
    } else {
        buttonSuccess.append(` ${checklist.buttons.success.text}`);
    }

    if (false === checklist.buttons.failed.enabled) {
        buttonFailed.classList.add('d-none');
    } else {
        buttonFailed.append(` ${checklist.buttons.failed.text}`);
    }

    for (let category of checklist.checklist) {
        let newCategory = document.createElement('div');
        newCategory.innerHTML = instance._templateCategory.innerHTML;
        newCategory.innerHTML = newCategory.innerHTML.replace(new RegExp('%number%', 'g'), number);
        newCategory.innerHTML = newCategory.innerHTML.replace(new RegExp('%title%', 'g'), category.title);

        const categoryContent = newCategory.children[0];
        const itemTarget = categoryContent.querySelector('[data-content]');

        for (let item of category.items) {
            let newItem = document.createElement('li');

            newItem.setAttribute('data-checked', '0');
            newItem.innerHTML = item.text;

            newItem.addEventListener('click', () => {
                newItem.setAttribute('data-checked', '0' === newItem.getAttribute('data-checked') ? '1' : '0');
            });

            itemTarget.append(newItem);
        }

        categoryTarget.append(categoryContent);
    }

    instance._checklistContent[number].appendChild(content);
}
