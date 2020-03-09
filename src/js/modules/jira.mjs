const receiveTitle = () => {
    return document.querySelector('#summary-val').innerText;
};

const sendComment = (comment) => {
    let commentBtn = document.querySelector('#footer-comment-button');

    commentBtn.click();
    let text = document.querySelector('#comment');
    text.value = comment;

    let send = document.querySelector('#issue-comment-add-submit');
    send.removeAttribute("disabled");
    send.click();

    return true;
};

export function createBoards(boards) {
    let target = document.querySelector('[data-select="board"]');

    for (let board of boards) {
        let option = document.createElement('option');
        option.innerHTML = board.key;

        target.appendChild(option);
    }
}

export function getIssueTitle() {
    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:

    return new Promise(resolve => {
        chrome.tabs.executeScript({
            code: '(' + receiveTitle + ')()',
        }, (result) => {
            resolve(result[0]);
        });
    });
}

export function createComment(type) {
    let code;

    switch (type) {
        case 'tester':
            code = '(' + sendComment + ')("h2. {color:#1e872b}Checklist{color}: Test OK! (y)")';
            break;
        case 'reviewer':
            code = '(' + sendComment + ')("h2. {color:#1e872b}Checklist{color}: Review OK! (y)")';
            break;
        default:
            code = '(' + sendComment + ')("h2. {color:#1e872b}Checklist{color}: All checked and done! (/)")';
            break;
    }

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    chrome.tabs.executeScript({
        code: code,
    });
}
