import * as checklist from "./modules/checklist.mjs";

chrome.tabs.query({active: true, currentWindow: true}, (tab) => {
    if (tab.length <= 0) {
        return;
    }

    checklist.init(tab[0].url);
});
