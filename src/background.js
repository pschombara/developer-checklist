chrome.runtime.onInstalled.addListener(details => {
    if ('installed' === details.reason) {
        chrome.runtime.openOptionsPage()
    }
})
