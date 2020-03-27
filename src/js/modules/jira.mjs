import {SuperJira} from "./super/super.jira";

export class Jira extends SuperJira{
    constructor() {
        super();
    }

    createBoards() {
        let target = document.querySelector('[data-select="board"]');

        for (let board of this.options.boards) {
            let option = document.createElement('option');
            option.innerHTML = board.key;

            target.appendChild(option);
        }
    }

    getIssueTitle() {
        //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:

        return new Promise(resolve => {
            chrome.tabs.executeScript({
                code: '(' + receiveTitle + ')()',
            }, (result) => {
                resolve(result[0]);
            });
        });
    }

    createComment(type) {
        let submit = true;
        let testFailed = new RegExp('^\\w+-failed$');

        if (false === this.options.comments.hasOwnProperty(type)) {
            return;
        }

        if (testFailed.test(type)) {
            submit = false;
        }

        //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
        chrome.tabs.executeScript({
            code: '(' + sendComment + ')(' + `"${this.options.comments[type]}", ${submit}` + ')',
        });
    }
}


const receiveTitle = () => {
    return document.querySelector('#summary-val').innerText;
};

const sendComment = (comment, submit) => {
    let commentBtn = document.querySelector('#footer-comment-button');

    commentBtn.click();
    let text = document.querySelector('#comment');
    text.value = comment;

    if (submit) {
        let send = document.querySelector('#issue-comment-add-submit');
        send.removeAttribute("disabled");
        send.click();
    }

    return true;
};
