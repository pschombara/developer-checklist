import {Checklist} from "./modules/checklist";

chrome.tabs.query({active: true, currentWindow: true}, (tab) => {
    if (tab.length <= 0) {
        return;
    }

    new Checklist().init(tab[0].url);
});
