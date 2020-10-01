import * as cheatSheet from './cheat-sheet.mjs';
import {RocketChat} from "./rocket.chat";
import {Storage} from "./storage";
import {Jira} from "./jira";
import {Jenkins} from "./jenkins";
import {Modules} from './modules';
import {GitLab} from './gitLab';

import './jquery.mjs';
import 'bootstrap';
import {Migration} from './migration/migration';

export class Checklist {
    constructor(url) {
        this._browser = window.browser ? window.browser : window.chrome;
        this._header = document.querySelector('[data-header]');
        this._missingOptions = true;
        this._jiraUrl = document.querySelector('.jira_url');
        this._issuePattern = new RegExp('[a-zA-Z]+-\\d+');
        this._identifier = '';
        this._options = {};
        this._rocketChat = new RocketChat();
        this._storage = new Storage();
        this._jira = new Jira();
        this._jenkins = new Jenkins();
        this._gitLab = new GitLab();
        this._modules = new Modules();
        this._migration = new Migration();
        this._issue = document.querySelector('#issue');
        this._url = url;
    }

    init() {
        this._storage.loadOptions().then((result) => {
            this._options = this._migration.migrate(result);

            if (this._migration.migrated) {
                this._storage.write('options', result);
            }

            checkOptions(this);
            this._storage.cleanUp();

            if (this._url.includes(this._options.jira.url) && this._issuePattern.test(this._url)) {
                let match = this._url.match(this._issuePattern)[0];
                this._identifier = match ? match : '';
            }

            const openOptionLinks = document.querySelectorAll('[data-open="options"]');

            for (let link of openOptionLinks) {
                link.addEventListener('click', () => {
                    let tab = '';

                    if (link.hasAttribute('data-open-extra')) {
                        tab = '#' + link.getAttribute('data-open-extra');
                    }

                    chrome.tabs.create({url: '/html/options.html' + `${tab}` });
                });
            }

            if (this._missingOptions) {
                showContent('missingOptions', this);
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

    if (cl._options.hasOwnProperty('rocketChat')) {
        cl._rocketChat.options = cl._options.rocketChat;
    }

    if (cl._options.hasOwnProperty('modules')) {
        cl._modules.options = cl._options.modules;
    }

    if (cl._options.hasOwnProperty('gitLab')) {
        cl._gitLab.options = cl._options.gitLab;
    }

    if (cl._options.hasOwnProperty('jenkins')) {
        cl._jenkins.options = cl._options.jenkins;
    }

    cl._gitLab.enabled = cl._modules.options.gitLab;
    cl._jenkins.enabled = cl._modules.options.jenkins;

    cl._missingOptions = false;
};

const initView = (cl) => {
    initOverview(cl);

    new Promise(resolve => {
        if ('' === cl._identifier) {
            cl._header.innerHTML = 'Checklist';
            resolve();
        } else {
            cl._header.innerHTML = cl._identifier;

            initIssue(cl).then(() => {
                resolve();
            });
        }
    }).then(() => {
        cl._modules.hideModules();

        showContent('checklist', cl);
    })
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

    cl._jenkins.init();
    cl._gitLab.init();
    cheatSheet.init(cl._options.cheatSheet ? cl._options.cheatSheet : []);

    cl._rocketChat.board = cl._options.jira.url;
    cl._rocketChat.identifier = cl._identifier;
    cl._rocketChat.init();
};

const initIssue = (cl) => {
    return new Promise(resolve => {
        document.addEventListener('saveChecklist', () => {
            save(cl).then(data => {
                cl._storage.write(cl._identifier, data);
            });
        })

        cl._storage.loadIssue(cl._identifier).then((stored) => {
            if (stored.hasOwnProperty('openTab')) {
                const tab = document.querySelector(`#${stored.openTab}`);

                if (null !== tab) {
                    tab.click();
                }
            }

            if (Array.isArray(stored)) {
                document.dispatchEvent(new CustomEvent('saveChecklist'));
                stored = {};
            }

            cl._jira.createChecklists(stored);

            Array.prototype.map.call(document.querySelectorAll('#listTab .nav-item'), (nav) => {
                $(nav).on('shown.bs.tab', () => {
                    document.dispatchEvent(new CustomEvent('saveChecklist'));

                    if ('Quick Select' === nav.getAttribute('data-content')) {
                        cl._issue.focus();
                    }
                });
            });

            resolve();
        });
    });
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
    cl._gitLab.checkUrl(cl._url);
};

const save = (cl) => {
    return new Promise(resolve => {
        const data = {
            updateDate: Math.floor(Date.now() / 1000),
            openTab: document.querySelector('#listTab .nav-link.active').getAttribute('id'),
            title: '',
            checklist: cl._jira.checkedEntries(),
            version: cl._migration.currentVersion,
        }

        cl._jira.getIssueTitle().then(result => {
            data.title = result;

            resolve(data);
        })
    });
}
