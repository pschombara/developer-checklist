import {SuperModules} from '../super/super.modules';

export class Modules extends SuperModules{
    constructor() {
        super();

        this._toogles = {
            jenkins: document.querySelector('#moduleJenkins'),
            cheatSheet: document.querySelector('#moduleCheatSheet'),
            rocketChat: document.querySelector('#moduleRocketChat'),
            gitLab: document.querySelector('#moduleGitLab'),
        }

        this._tabs = {
            jenkins: document.querySelector('#jenkins-tab'),
            cheatSheet: document.querySelector('#cheat-sheet-tab'),
            rocketChat: document.querySelector('#rocket-chat-tab'),
            gitLab: document.querySelector('#git-tab'),
        }
    }

    init() {
        Object.keys(this.options).forEach((module) => {
            this._toogles[module].addEventListener('change', () => {
                this.options[module] = this._toogles[module].checked;
                this.changeVisibility(module);
            });

            this._toogles[module].checked = this.options[module];

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
