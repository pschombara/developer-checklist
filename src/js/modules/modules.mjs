import {SuperModules} from './super/super.modules';

export class Modules extends SuperModules
{
    constructor() {
        super();

        this._modules = document.querySelectorAll('[data-module]');
    }

    hasSpecial() {
        return this.options.gitLab || this.options.rocketChat || this.options.jenkins;
    }

    hideModules() {
        this._decideModuleEnabled = Object.assign(this.options, {
            special: this.hasSpecial(),
        });

        for (let module of this._modules) {
            console.log(module, this._decideModuleEnabled);
            if (false === this._decideModuleEnabled[module.getAttribute('data-module')]) {
                module.classList.add('d-none');
            }
        }
    }
}
