chrome.runtime.onInstalled.addListener(details => {
    if ('installed' === details.reason) {
        chrome.runtime.openOptionsPage()
    }
})

chrome.storage.local.onChanged.addListener(changes => {
    //console.log(changes)
})
