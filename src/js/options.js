import * as options from './modules/options.mjs';
import {ErrorPrompt, Toast,} from "./modules/sweet";
import {validator} from "./modules/options";

(() => {
    const saves = document.querySelectorAll('[data-save]');

    for (let save of saves) {
        save.addEventListener('click', () => {
            if (false === options.save(save.getAttribute('data-save'))) {
                ErrorPrompt.fire({
                    title: 'One or more options are invalid!',
                    html: validator.htmlErrors,
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
