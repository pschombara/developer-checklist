import * as storage from './storage.mjs';
import * as jenkins from './jenkins.mjs';
import * as jira from './jira.mjs';
import {RocketChat} from "./rocket.chat";

import './jquery.mjs';
import 'bootstrap';

// todo replace with options
const listTypes = ['developer', 'tester', 'reviewer', 'help'];
const browser = window.browser ? window.browser : window.chrome;

let clearButtons = document.querySelectorAll('[data-btn="clear"]');
let jiraCommentButtons = document.querySelectorAll('[data-btn="comment"]');

let overviewInitiated = false;
let issueInitiated = false;
let initiated = false;
let missingOptions = true;

let jiraUrl = document.querySelector('.jira_url');
let issuePattern = new RegExp('\\w+-\\d+');
let identifier = '';

let options = {};
let checkLists = [];

let rocketChat = new RocketChat();

const checkIsChecked = (items, id) => {
    for (let item of items) {
        if (item.id === id) {
            return item.checked;
        }
    }

    return false;
};

const sync = (optionsList, issueLists) => {
    if (0 === issueLists.length) {
        return optionsList;
    }

    let lists = [];

    optionsList.forEach((content, key) => {
        let items = [];

        content.items.forEach((item, innerKey) => {
            items.push({
                text: item.text,
                checked: checkIsChecked(undefined !== issueLists[key] ? issueLists[key].items : [], item.id),
                id: item.id
            });
        });

        lists[key] = {
            id: content.id,
            title: content.title,
            items: items
        };
    });

    return lists;
};

const checkOptions = () => {
    if (options.hasOwnProperty('jira')) {
        jira.createBoards(options.jira.boards);

        if (0 !== (options.jira.boards[0].id ? options.jira.boards[0].id : 0)) {
            jiraUrl.href = options.jira.url + `/secure/RapidBoard.jspa?rapidView=${options.jira.boards[0].id}`;
        } else {
            jiraUrl.href = options.jira.url + '/secure/ManageRapidViews.jspa';
        }
    }

    if (options.hasOwnProperty('lists')) {
        missingOptions = false;
    }

    if (options.hasOwnProperty('rocketChat')) {
        rocketChat.options = options.rocketChat;
    }
};

const initOverview = () => {
    if (overviewInitiated) {
        showContent('disclaimer');
        return;
    }

    let buttonIssue = document.querySelector('#buttonIssue');
    let issue = document.querySelector('#issue');
    let select = document.querySelector('[data-select="board"]');
    let issuesProgress = document.querySelector('[data-progress="issueProgress"]');

    if ('' === options.jira.url ? options.jira.url : '') {
        buttonIssue.disabled = true;
    } else {
        buttonIssue.addEventListener('click', () => {
            browser.tabs.create({url: options.jira.url + '/browse/' + select.value + '-' + issue.value});
        });

        issue.addEventListener('keyup', (e) => {
            if ('Enter' === e.key) {
                e.preventDefault();
                buttonIssue.click();
            }
        });

        if ('' !== identifier) {
            document.querySelector('[data-content="disclaimer"] [data-btn="changeView"]').addEventListener('click', initIssue);
        } else {
            document.querySelector('[data-content="disclaimer"] [data-btn="changeView"]').classList.add('d-none');
        }

        storage.loadIdentifiers().then((identifiers) => {
            let issues = 0;

            for (let identifier of identifiers) {
                if (issues >= (options.jira.maximumIssues ? options.jira.maximumIssues : 6)) {
                    break;
                }

                let div = document.createElement('div');
                let btn = document.createElement('button');

                div.classList.add('mt-2', 'col-4');
                btn.innerHTML = identifier.key;
                btn.classList.add('btn', 'btn-light', 'btn-block', 'btn-sm');
                btn.setAttribute('title', identifier.title);
                btn.setAttribute('data-toggle', 'tooltip');
                btn.addEventListener('click', () => {
                    browser.tabs.create({url: options.jira.url + '/browse/' + identifier.key});
                });

                div.appendChild(btn);
                issuesProgress.appendChild(div);
                issues++;
            }

            $('[data-toggle="tooltip"]').tooltip();

            if (0 === options.jira.maximumIssues ? options.jira.maximumIssues : 6) {
                document.querySelector('[data-issues]').classList.add('d-none');
            }
        })
    }

    if (missingOptions) {
        document.querySelector('.no-options').classList.remove('d-none');
    }

    overviewInitiated = true;

    showContent('disclaimer');
};

const initIssue = () => {
    if (issueInitiated) {
        showContent('checklist');
        return;
    }

    document.querySelector('[data-header]').innerHTML += identifier;

    jenkins.init(options.jenkins ? options.jenkins : []);

    storage.loadIssue(identifier).then((stored) => {
        for (let type of listTypes) {
            createList(sync(options.lists[type] ? options.lists[type] : [], stored[type] ? stored[type] : []), type);
        }

        save();

        if (stored.hasOwnProperty('openTab')) {
            document.querySelector(`#${stored.openTab}`).click();
        }
    });

    for (let btn of clearButtons) {
        btn.addEventListener('click', clear);
    }

    document.querySelector('[data-content="checklist"] [data-btn="changeView"]').addEventListener('click', initOverview);

    Array.prototype.map.call(document.querySelectorAll('#listTab .nav-item'), (nav) => {
        $(nav).on('shown.bs.tab', save);
    });

    for (let btn of jiraCommentButtons) {
        btn.addEventListener('click', () => {
            jira.createComment(btn.getAttribute('data-type'));
        });
    }

    rocketChat.board = options.jira.url;
    rocketChat.identifier = identifier;
    rocketChat.init();

    showContent('checklist');

    issueInitiated = true;
};

const checkSubListFinished = (type, id, collapse, content) => {
    let subListNotFinished = document.querySelectorAll(`[data-list="${type}"] [data-check="${id}"]:not(.checked)`);

    collapse.classList.remove('checked');

    if (0 === subListNotFinished.length) {
        collapse.classList.add('checked');
        content.classList.add('d-none');
    }
};

const checkIfFinished = (type) => {
    if ('help' === type) {
        return;
    }

    let listNotFinished = document.querySelectorAll(`[data-list="${type}"] [data-check]:not(.checked)`);
    let btn = document.querySelector(`[data-type="${type}"][data-btn="comment"]`);

    btn.setAttribute('disabled', 'disabled');

    if (0 === listNotFinished.length) {
        btn.removeAttribute('disabled');
    }
};

const checkListEntry = (contentId, id, isChecked, type) => {
    for (let key in checkLists[type][contentId - 1].items) {
        if (checkLists[type][contentId - 1].items[key].id === id) {
            checkLists[type][contentId - 1].items[key].checked = isChecked;

            save();

            return;
        }
    }
};

const createList = (loadedLists, type) => {
    let lists = document.querySelector(`[data-list="${type}"]`);
    let template = document.querySelector('[data-template="list"]');
    checkLists[type] = loadedLists;

    for (let list of checkLists[type]) {
        let temp = template.innerHTML;

        temp = temp.replace(new RegExp('%number%', 'g'), list.id);
        temp = temp.replace('%title%', list.title);

        let elem = document.createElement('div');
        elem.innerHTML = temp;

        let collapse = elem.children[0].querySelector(`[data-collapse="${list.id}"]`);
        let content = elem.children[0].querySelector(`[data-content="${list.id}"]`);

        collapse.addEventListener('click', () => {
            content.classList.toggle('d-none');
        });

        if (checkLists[type].length > 1) {
            content.classList.add('d-none');
        }

        for (let item of list.items) {
            let li = document.createElement('li');
            li.innerHTML = item.text;

            li.setAttribute('data-identifier', item.id);
            li.setAttribute('data-check', list.id);

            if (item.checked) {
                li.classList.add('checked');
            }

            li.addEventListener('click', () => {
                li.classList.toggle('checked');

                checkSubListFinished(type, list.id, collapse, content);
                checkIfFinished(type);
                checkListEntry(list.id, item.id, li.classList.contains('checked'), type);
            });

            content.appendChild(li);
        }

        lists.appendChild(elem);
        checkIfFinished(type);
        checkSubListFinished(type, list.id, collapse, content)
    }
};

const showContent = (contentType) => {
    let contents = document.querySelectorAll('.app--content[data-content]');

    for (let content of contents) {
        if (contentType === content.getAttribute('data-content')) {
            content.classList.remove('d-none');
        } else {
            content.classList.add('d-none');
        }
    }
};

const save = () => {
    reduceLists().then((lists) => {
        storage.write(identifier, lists);
    });
};

const reduceLists = () => {
    return new Promise(resolve => {
        let lists = {};

        for (let type of listTypes) {
            lists[type] = [];

            for (let content of checkLists[type]) {
                let items = [];

                for (let item of content.items) {
                    items.push({
                        checked: item.checked,
                        id: item.id,
                    });
                }

                lists[type].push({
                    id: content.id,
                    items: items,
                });
            }
        }

        lists.updateDate = Math.floor(Date.now() / 1000);
        lists.openTab = document.querySelector('#listTab .nav-link.active').getAttribute('id');

        jira.getIssueTitle().then((result) => {
            lists.title = result;

            resolve(lists);
        });
    });
};

const clear = () => {
    checkLists = options.lists;
    save();

    document.querySelectorAll('[data-collapse].checked').forEach((element) => {
        element.classList.remove('checked');
    });

    document.querySelectorAll('[data-check].checked').forEach((element) => {
        element.classList.remove('checked');
    });

    document.querySelectorAll('[data-btn][data-type]').forEach((element) => {
        element.setAttribute('disabled', 'disabled');
    });
};

export function init(url) {
    if (initiated) {
        return;
    }

    storage.loadOptions().then((result) => {
        options = result;
        checkOptions();
        storage.cleanUp();

        if (url.includes(options.jira.url) && issuePattern.test(url)) {
            let match = url.match(issuePattern)[0];
            identifier = match ? match : '';
            initIssue();
        } else {
            initOverview();
        }

        initiated = true;
    });
}
