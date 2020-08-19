import {SuperGitLab} from './super/super.gitLab';
import {Toast} from './sweet';

export class GitLab extends SuperGitLab {
    constructor() {
        super();

        this._gitMergeUrl = `[{aliasUrl}|${this.options.host}{domain}/{project}/merge_requests/{number}]`;
        this._mergeRequestUrl = document.querySelector('[data-gitLab-url]');
        this._copyBtn = document.querySelector('[data-copy="gitLab-url"]');
        this._tab = document.querySelector('#special-tab');
        this._gitLabProjects = document.querySelector('#gitLabProjects');
        this._input = {
            project: document.querySelector('[list="gitLabProjects"]'),
            mergeNumber: document.querySelector('[data-gitLab-merge-request]'),
        };
    }

    init() {
        for (let item of this.options.projects) {
            const option = document.createElement('option');
            option.value = item.project;
            option.setAttribute('data-domain', item.domain);

            this._gitLabProjects.appendChild(option);
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
        let selected = this._gitLabProjects.querySelector(`option[value="${this._input.project.value}"]`);

        if ('' === this._input.mergeNumber.value || null === selected) {
            this._mergeRequestUrl.value = '';
        } else {
            this._mergeRequestUrl.value = this._gitMergeUrl.replace(new RegExp('\{aliasUrl\}', 'g'), '' !== branch ? `${selected.value}:${branch}` : selected.value);
            this._mergeRequestUrl.value = this._mergeRequestUrl.value.replace(new RegExp('\{project\}', 'g'), selected.value);
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
        if (false === url.startsWith(this.options.host)) {
            return;
        }

        this._tab.click();

        for (let item of this.options.projects) {
            if (false === url.includes(`${item.domain}/${item.project}/`)) {
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
