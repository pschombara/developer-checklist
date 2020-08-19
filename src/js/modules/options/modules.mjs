export class Modules {
    constructor() {
        this._modules = {
            jenkins: true,
            cheatSheet: true,
            rocketChat: true,
            gitLab: true
        }

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
        Object.keys(this._modules).forEach((module) => {
            this._toogles[module].addEventListener('change', () => {
                this._modules[module] = this._toogles[module].checked;
                this.changeVisibility(module);
            });

            this._toogles[module].checked = this._modules[module];

            this.changeVisibility(module);
        });
    }

    changeVisibility(module) {
        if (false === this._modules[module]) {
            this._tabs[module].classList.add('d-none');
        } else {
            this._tabs[module].classList.remove('d-none');
        }
    }

    save() {
        return this._modules;
    }
}
