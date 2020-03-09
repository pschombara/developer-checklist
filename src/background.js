chrome.runtime.onInstalled.addListener(function (details) {
    if ("install" === details.reason) {
        chrome.runtime.openOptionsPage();
    }
});

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if ("trigger comment" === request.cmd) {

            sendResponse({result: "läuft"});
        } else {
            sendResponse({result: "error", message: `Invalid 'cmd'`});
        }
        // Note: Returning true is required here!
        //  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
        return true;
    });
