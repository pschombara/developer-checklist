import {SuperModules} from '../super/super.modules';

export class Modules extends SuperModules{
    constructor() {
        super();

        this._toggles = {
            jenkins: document.querySelector('#moduleJenkins'),
            cheatSheet: document.querySelector('#moduleCheatSheet'),
            chat: document.querySelector('#moduleChat'),
            gitLab: document.querySelector('#moduleGitLab'),
        }

        this._tabs = {
            jenkins: document.querySelector('#jenkins-tab'),
            cheatSheet: document.querySelector('#cheat-sheet-tab'),
            chat: document.querySelector('#chat-tab'),
            gitLab: document.querySelector('#gitLab-tab'),
        }
    }

    init() {
        Object.keys(this.options).forEach((module) => {
            this._toggles[module].addEventListener('change', () => {
                this.options[module] = this._toggles[module].checked;
                this.changeVisibility(module);
            });

            this._toggles[module].checked = this.options[module];

            this.changeVisibility(module);
        });
    }

    changeVisibility(module) {
        if (false === this.options[module]) {
            this._tabs[module].classList.add('d-none');
        } else {
            this._tabs[module].classList.remove('d-none');
        }
    }

    save() {
        return this.options;
    }
}
