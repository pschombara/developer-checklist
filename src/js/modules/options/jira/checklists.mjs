export class Checklists {
    constructor() {
    }

    init(checklists) {
        let count = 0;

        for (let checklist of checklists) {

            if (++count >= 4) {
                return;
            }
        }
    }

    save() {
        return [];
    }
}
