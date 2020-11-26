import './modules/jquery';
import 'bootstrap';
import {ErrorPrompt, Toast,} from './modules/sweet';
import {Options} from './modules/options';

(() => {
    const saves = document.querySelectorAll('[data-save]');
    const options = new Options();

    for (let save of saves) {
        save.addEventListener('click', () => {
            if (false === options.save(save.getAttribute('data-save'))) {
                ErrorPrompt.fire({
                    title: 'One or more options are invalid!',
                    html: options.validator.htmlErrors,
                });

                return;
            }

            let title = 'Saved';

            if ('export' === save.getAttribute('data-save')) {
                title = 'Saved and Exported!';
            }
            Toast.fire({
                icon: 'success',
                title: title,
                onClose: () => {
                    const activeTabs = document.querySelectorAll('.tab-pane.active');
                    let hash = '';

                    for (let tab of activeTabs) {
                        hash += '#' + tab.getAttribute('id');
                    }

                    window.location.hash = hash;
                    location.reload();
                }
            });
        });
    }

    options.init().then(() => {
        chrome.tabs.query({active: true, currentWindow: true}, (tab) => {
            if (0 === tab.length) {
                return;
            }

            if (false === tab[0].url.includes('#')) {
                return;
            }

            const tabIdentifiers = tab[0].url.split('#');
            tabIdentifiers.shift();

            for (let tabIdentifier of tabIdentifiers) {
                const targetTab = document.querySelector(`#${tabIdentifier}-tab`);

                if (null !== targetTab) {
                    targetTab.click();
                }
            }

            window.location.hash = '';
        });
    });
})();
