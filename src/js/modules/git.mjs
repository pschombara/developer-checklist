import {Toast} from "./sweet";

export class Git {
    constructor() {
        this._host = 'http://tg-git.tyre24.local/';
        this._gitMergeUrl = `[{project}|${this._host}{domain}/{project}/merge_requests/{number}]`;
        this._mergeRequestUrl = document.querySelector('[data-git-url]');
        this._copyBtn = document.querySelector('[data-copy="git-url"]');
        this._tab = document.querySelector('#special-tab');
        this._gitProjects = document.querySelector('#gitProjects');
        this._input = {
            project: document.querySelector('[list="gitProjects"]'),
            mergeNumber: document.querySelector('[data-git-merge-request]'),
        };
        this._projects = [];
    }

    init(projects) {
        this._projects = projects;

        for (let item of this._projects) {
            let option = document.createElement('option');
            option.value = item.project;
            option.setAttribute('data-domain', item.domain);

            this._gitProjects.appendChild(option);
        }

        this._input.project.addEventListener('click', () => {
            this._input.project.value = '';
        });

        this._input.project.addEventListener('change', () => { this.buildUrl() } );
        this._input.mergeNumber.addEventListener('change', () => { this.buildUrl() } );
        this._input.mergeNumber.addEventListener('keyup', () => { this.buildUrl() } );

        this._mergeRequestUrl.addEventListener('click', () => { this.copy() } );
        this._copyBtn.addEventListener('click', () => { this.copy() } );
    }

    buildUrl(branch = '') {
        let selected = this._gitProjects.querySelector(`option[value="${this._input.project.value}"]`);

        if ('' === this._input.mergeNumber.value || null === selected) {
            this._mergeRequestUrl.value = '';
        } else {
            let project = '' !== branch ? `${selected.value}:${branch}` : selected.value;

            this._mergeRequestUrl.value = this._gitMergeUrl.replace(new RegExp('\{project\}', 'g'), project);
            this._mergeRequestUrl.value = this._mergeRequestUrl.value.replace(new RegExp('\{domain\}', 'g'), selected.getAttribute('data-domain'));
            this._mergeRequestUrl.value = this._mergeRequestUrl.value.replace(new RegExp('\{number\}', 'g'), this._input.mergeNumber.value);
        }
    }

    copy() {
        if ('' === this._mergeRequestUrl.value) {
            Toast.fire({
                icon: "error",
                title: "First fill out project and merge request number.",
                position: "bottom"
            });

            return;
        }

        this._mergeRequestUrl.select();
        document.execCommand('copy');
        window.getSelection().removeAllRanges();

        Toast.fire({
            icon: "success",
            title: "Copied to clipboard",
            position: "bottom"
        });
    }

    checkUrl(url) {
        if (false === url.startsWith(this._host)) {
            return;
        }

        this._tab.click();

        for (let item of this._projects) {
            if (false === url.includes(`${item.domain}/${item.project}`)) {
                continue;
            }

            this._input.project.value = item.project;
        }

        if ('' === this._input.project.value) {
            return;
        }

        let mergeRequestNumber = url.match(new RegExp('merge_requests\/(\\d+)'));

        if (null === mergeRequestNumber || mergeRequestNumber.length < 2) {
            return;
        }

        this._input.mergeNumber.value = mergeRequestNumber[1];

        const checkBranch = () => {
            let sourceBranch = document.querySelector('.js-source-branch > a');

            if (null !== sourceBranch) {
                return sourceBranch.innerText;
            }

            return '';
        };

        chrome.tabs.executeScript({
            code: '(' + checkBranch + ')()',
        }, (result) => {
            this.buildUrl(result[0]);
        });
    }
}
