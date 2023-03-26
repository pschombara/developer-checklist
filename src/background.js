chrome.runtime.onMessage.addListener(({type, name}) => {
    console.log(type, name)
})

chrome.runtime.onInstalled.addListener(details => {
    if ('installed' === details.reason) {
        chrome.runtime.openOptionsPage()
    }
})

chrome.storage.local.onChanged.addListener(changes => {
    console.log(changes)
})
