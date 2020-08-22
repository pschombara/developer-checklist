import {SuperJira} from "../super/super.jira";
import {Boards} from './jira/boards';
import {General} from './jira/general';
import {Checklists} from './jira/checklists';

export class Jira extends SuperJira {
    constructor() {
        super();

        this._boards = new Boards();
        this._general = new General();
        this._checklists = new Checklists();
    }

    init() {
        this._boards.init(this.options.boards);
        this._general.init(this.options);
    }

    save() {
        let jira = {
            boards: this._boards.save(),
            checklists: [ ], // todo
        };

        return Object.assign(jira, this._general.save());
    }
}
