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

export function createComment(type, comments) {
    let code;

    switch (type) {
        case 'tester':
            code = '(' + sendComment + ')(' + `"${comments[1].message}"` + ')';
            break;
        case 'reviewer':
            code = '(' + sendComment + ')(' + `"${comments[2].message}"` + ')';
            break;
        default:
            code = '(' + sendComment + ')(' + `"${comments[0].message}"` + ')';
            break;
    }

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    chrome.tabs.executeScript({
        code: code,
    });
}
