import * as cheatSheet from './cheat-sheet.mjs';
import {RocketChat} from "./rocket.chat";
import {Storage} from "./storage";
import {Jira} from "./jira";
import {Jenkins} from "./jenkins";
import {Git} from "./git";

import './jquery.mjs';
import 'bootstrap';

export class Checklist {
    constructor(url) {
        this._listTypes = ['developer', 'tester', 'reviewer', 'help']; // todo replace with options
        this._browser = window.browser ? window.browser : window.chrome;
        this._buttons = {
            clear: document.querySelectorAll('[data-btn="clear"]'),
            jiraComment: document.querySelectorAll('[data-btn="comment"]'),
        };
        this._header = document.querySelector('[data-header]');
        this._missingOptions = true;
        this._jiraUrl = document.querySelector('.jira_url');
        this._issuePattern = new RegExp('[a-zA-Z]+-\\d+');
        this._identifier = '';
        this._options = {};
        this._checkLists = [];
        this._rocketChat = new RocketChat();
        this._storage = new Storage();
        this._jira = new Jira();
        this._jenkins = new Jenkins();
        this._git = new Git();
        this._issue = document.querySelector('#issue');
        this._checklistTabs = document.querySelectorAll('[data-tab-show="checklist"]');
        this._url = url;
    }

    init() {
        this._storage.loadOptions().then((result) => {
            this._options = result;
            checkOptions(this);
            this._storage.cleanUp();

            if (this._url.includes(this._options.jira.url) && this._issuePattern.test(this._url)) {
                let match = this._url.match(this._issuePattern)[0];
                this._identifier = match ? match : '';
            }

            if (this._missingOptions) {
                showContent('missingOptions', this);

                document.querySelector('[data-open="options"]').addEventListener('click', () => {
                    chrome.tabs.create({url: '/html/options.html'});
                });
            } else {
                initView(this);
            }

            $('[data-toggle="tooltip"]').tooltip();
            $('[data-toggle="popover"]').popover({
                trigger: "hover",
            });
        });
    }
}

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

const checkOptions = (cl) => {
    if (cl._options.hasOwnProperty('jira')) {
        cl._jira.options = cl._options.jira;
        cl._jira.createBoards();

        if ('' === cl._options.jira.url) {
            return;
        }

        if (0 !== cl._options.jira.boards.length && 0 !== (cl._options.jira.boards[0].id ? cl._options.jira.boards[0].id : 0)) {
            cl._jiraUrl.href = cl._options.jira.url + `/secure/RapidBoard.jspa?rapidView=${cl._options.jira.boards[0].id}`;
        } else {
            cl._jiraUrl.href = cl._options.jira.url + '/secure/ManageRapidViews.jspa';
        }

        if (0 === cl._options.jira.boards.length) {
            let buttonIssue = document.querySelector('#buttonIssue');
            buttonIssue.disabled = true;
            buttonIssue.setAttribute('title', 'At least one board needs to be configured in the options!');
        }
    }

    if (cl._options.hasOwnProperty('lists')) {
        cl._missingOptions = false;
    }

    if (cl._options.hasOwnProperty('rocketChat')) {
        cl._rocketChat.options = cl._options.rocketChat;
    }
};

const initView = (cl) => {
    initOverview(cl);

    if ('' === cl._identifier) {
        cl._header.innerHTML = 'Checklist';
    } else {
        cl._header.innerHTML = cl._identifier;

        initIssue(cl);
    }

    showContent('checklist', cl);
};

const initOverview = (cl) => {
    let buttonIssue = document.querySelector('#buttonIssue');
    let select = document.querySelector('[data-select="board"]');
    let issuesProgress = document.querySelector('[data-progress="issueProgress"]');

    if ('' === cl._options.jira.url ? cl._options.jira.url : '') {
        buttonIssue.disabled = true;
    } else {
        buttonIssue.addEventListener('click', () => {
           cl._browser.tabs.create({url: `${cl._options.jira.url}/browse/${select.value}-${cl._issue.value}`});
        });

        cl._issue.addEventListener('keyup', (e) => {
            e.preventDefault();

            if ('Enter' === e.key) {
                buttonIssue.click();
            }
        });

        cl._storage.loadIdentifiers().then((identifiers) => {
            let issues = 0;

            for (let identifier of identifiers) {
                if (issues >= (cl._options.jira.maximumIssues ? cl._options.jira.maximumIssues : 6)) {
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
                    cl._browser.tabs.create({url: `${cl._options.jira.url}/browse/${identifier.key}`});
                });

                div.appendChild(btn);
                issuesProgress.appendChild(div);
                issues++;
            }

            if (0 === (cl._options.jira.maximumIssues ? cl._options.jira.maximumIssues : 6) || 0 === issues) {
                document.querySelector('[data-issues]').classList.add('d-none');
            }
        });
    }

    if (cl._missingOptions) {
        document.querySelector('.no-options').classList.remove('d-none');
    }

    cl._jenkins.init(cl._options.jenkins ? cl._options.jenkins : []);
    cl._git.init(cl._options.git ? cl._options.git : []);
    cheatSheet.init(cl._options.cheatSheet ? cl._options.cheatSheet : []);

    cl._rocketChat.board = cl._options.jira.url;
    cl._rocketChat.identifier = cl._identifier;
    cl._rocketChat.init();
};

const initIssue = (cl) => {
    cl._storage.loadIssue(cl._identifier).then((stored) => {
        for (let type of cl._listTypes) {
            createList(cl, sync(cl._options.lists[type] ? cl._options.lists[type] : [], stored[type] ? stored[type] : []), type);
        }

        save(cl);

        if (stored.hasOwnProperty('openTab')) {
            document.querySelector(`#${stored.openTab}`).click();
        }
    });

    for (let btn of cl._buttons.clear) {
        btn.addEventListener('click', () => {
            clear(cl);
        });
    }

    Array.prototype.map.call(document.querySelectorAll('#listTab .nav-item'), (nav) => {
        $(nav).on('shown.bs.tab', () => {
            save(cl);

            if ('Quick Select' === nav.getAttribute('data-content')) {
                cl._issue.focus();
            }
        });
    });

    for (let btn of cl._buttons.jiraComment) {
        btn.addEventListener('click', () => {
            cl._jira.createComment(btn.getAttribute('data-type'));
        });
    }

    for (let tab of cl._checklistTabs) {
        tab.classList.remove('d-none');
    }
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
    let btn = document.querySelector(`#${type} [data-btn="comment"][data-comment="success"]`);

    btn.setAttribute('disabled', 'disabled');

    if (0 === listNotFinished.length) {
        btn.removeAttribute('disabled');
    }
};

const checkListEntry = (cl, contentId, id, isChecked, type) => {
    for (let key in cl._checkLists[type][contentId - 1].items) {
        if (cl._checkLists[type][contentId - 1].items[key].id === id) {
            cl._checkLists[type][contentId - 1].items[key].checked = isChecked;

            save(cl);

            return;
        }
    }
};

const createList = (cl, loadedLists, type) => {
    let lists = document.querySelector(`[data-list="${type}"]`);
    let template = document.querySelector('[data-template="list"]');
    cl._checkLists[type] = loadedLists;

    for (let list of cl._checkLists[type]) {
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

        if (cl._checkLists[type].length > 1) {
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
                checkListEntry(cl, list.id, item.id, li.classList.contains('checked'), type);
            });

            content.appendChild(li);
        }

        lists.appendChild(elem);
        checkIfFinished(type);
        checkSubListFinished(type, list.id, collapse, content)
    }
};

const showContent = (contentType, cl) => {
    let contents = document.querySelectorAll('.app--content[data-content]');

    for (let content of contents) {
        if (contentType === content.getAttribute('data-content')) {
            content.classList.remove('d-none');
        } else {
            content.classList.add('d-none');
        }
    }

    if (cl._issue.closest('.tab-pane').classList.contains('show')) {
        cl._issue.focus();
    }

    cl._jenkins.checkUrl(cl._url);
    cl._git.checkUrl(cl._url);
};

const save = (cl) => {
    reduceLists(cl).then((lists) => {
        cl._storage.write(cl._identifier, lists);
    });
};

const reduceLists = (cl) => {
    return new Promise(resolve => {
        let lists = {};

        for (let type of cl._listTypes) {
            lists[type] = [];

            for (let content of cl._checkLists[type]) {
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

        cl._jira.getIssueTitle().then((result) => {
            lists.title = result;

            resolve(lists);
        });
    });
};

const clear = (cl) => {
    cl._checkLists = cl._options.lists;
    save(cl);

    document.querySelectorAll('[data-collapse].checked').forEach((element) => {
        element.classList.remove('checked');
    });

    document.querySelectorAll('[data-check].checked').forEach((element) => {
        element.classList.remove('checked');
    });

    document.querySelectorAll('[data-btn][data-type].btn-outline-success').forEach((element) => {
        element.setAttribute('disabled', 'disabled');
    });
};
