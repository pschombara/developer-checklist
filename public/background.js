chrome.runtime.onMessage.addListener(({type, name}) => {
    console.log(type, name)
})

chrome.runtime.onInstalled.addListener(details => {
    if ('installed' === details.reason) {
        chrome.runtime.openOptionsPage()
    } else if ('updated' === details.reason) {
        chrome.runtime.openOptionsPage() // todo remove used to reload extension
    }
})
