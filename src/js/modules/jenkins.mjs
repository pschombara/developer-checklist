import {Toast} from './sweet.mjs';
import {SuperJenkins} from './super/super.jenkins';

export class Jenkins extends SuperJenkins {
    constructor() {
        super();

        this._jenkinsBuildUrl = '[!{host}buildStatus/icon?job={job}&build={build}&style=flat-square&subject={name}!|{host}view/{type}/job/{job}/{build}/]';

        this._embeddableUrl = document.querySelector('[data-jenkins-url]');
        this._copyBtn = document.querySelector('[data-copy="jenkins-url"]');
        this._job = document.querySelector('[data-jenkins-jobs]');
        this._build = document.querySelector('[data-jenkins-build]');
        this._jobInput = document.querySelector('[list="jenkinsJobs"]');
        this._tab = document.querySelector('#special-tab');
        this._area = {
            enabled: document.querySelector('[data-jenkins="enabled"]'),
            disabled: document.querySelector('[data-jenkins="disabled"]'),
        };

        this._enabled = false;
    }

    set enabled(enabled) {
        this._enabled = enabled;
    }

    init() {
        if ('' === this.options.host) {
            this._area.enabled.classList.add('d-none');
            this._area.disabled.classList.remove('d-none');

            return;
        }

        for (let item of this.options.builds) {
            const option = document.createElement('option');
            option.value = item.name;
            option.setAttribute('data-type', item.type);
            option.setAttribute('data-job', item.job);
            option.setAttribute('data-label', item.label);
            this._job.appendChild(option);
        }

        this._jobInput.addEventListener('click', () => {
            this._jobInput.value = '';
        });

        this._jobInput.addEventListener('change', () => { this.buildUrl(); });
        this._build.addEventListener('change', () => { this.buildUrl(); });
        this._build.addEventListener('keyup', () => { this.buildUrl(); });

        this._embeddableUrl.addEventListener('click', () => { this.copy(); });
        this._copyBtn.addEventListener('click', () => { this.copy(); });
    }

    buildUrl() {
        const selected = document.querySelector(`#jenkinsJobs option[value="${this._jobInput.value}"]`);

        if ('' === this._build.value || null === selected || '' === this.options.host) {
            this._embeddableUrl.value = '';
        } else {
            this._embeddableUrl.value = this._jenkinsBuildUrl.replace(new RegExp('\{host\}', 'g'), this.options.host);
            this._embeddableUrl.value = this._embeddableUrl.value.replace(new RegExp('\{type\}', 'g'), selected.getAttribute('data-type'));
            this._embeddableUrl.value = this._embeddableUrl.value.replace(new RegExp('\{job\}', 'g'), selected.getAttribute('data-job'));
            this._embeddableUrl.value = this._embeddableUrl.value.replace(new RegExp('\{name\}', 'g'), '' !== selected.getAttribute('data-label') ? selected.getAttribute('data-label') : selected.value);
            this._embeddableUrl.value = this._embeddableUrl.value.replace(new RegExp('\{build\}', 'g'), this._build.value);
        }
    }

    copy() {
        if ('' === this._embeddableUrl.value) {
            Toast.fire({
                icon: 'error',
                title: 'First fill out job and build number.',
                position: 'bottom'
            });

            return;
        }

        this._embeddableUrl.select();
        document.execCommand('copy');
        window.getSelection().removeAllRanges();

        Toast.fire({
            icon: 'success',
            title: 'Copied to clipboard',
            position: 'bottom'
        });
    }

    checkUrl(url) {
        if (false === this._enabled || '' === this.options.host || false === url.startsWith(this.options.host)) {
            return;
        }

        this._tab.click();

        for (let item of this.options.builds) {
            if (false === url.includes(`/job/${item.job}/`)) {
                continue;
            }

            this._jobInput.value = item.name;
        }

        if ('' === this._jobInput.value) {
            return;
        }

        const checkPage = () => {
            let title = document.querySelector('title');

            if (null !== title) {
                let buildNumber = title.innerHTML.match(new RegExp('#(\\d+)'));

                if (null !== buildNumber && buildNumber.length > 1) {
                    return buildNumber[1];
                }
            }

            let lastBuild = document.querySelector('[update-parent-class=".build-row"]').href;
            let buildNumber = lastBuild.match(new RegExp('(\\d+)\/$'));

            if (null !== buildNumber && buildNumber.length > 1) {
                return buildNumber[1];
            }

            return null;
        };

        chrome.tabs.executeScript({
            code: '(' + checkPage + ')()',
        }, (result) => {
            if (result.length > 0 && null !== result[0]) {
                this._build.value = result[0];
                this.buildUrl();
            }
        });
    }
}
