import * as options from './modules/options.mjs';
import {Toast} from "./modules/sweet.mjs";

(() => {
    const saves = document.querySelectorAll('[data-save]');

    for (let save of saves) {
        save.addEventListener('click', () => {
            if (false === options.save(save.getAttribute('data-save'))) {
                Toast.fire({
                    icon: 'error',
                    title: 'One or more options are invalid!',
                });
                return
            }

            let title = 'Saved';

            if ('export' === save.getAttribute('data-save')) {
                title = 'Saved and Exported!';
            }
            Toast.fire({
                icon: 'success',
                title: title,
                onClose: () => {
                    location.reload();
                }
            });
        });
    }

    options.init();
})();
