import OnInstalledReason = chrome.runtime.OnInstalledReason;

export default defineBackground(() => {
    browser.runtime.onInstalled.addListener(details => {
        if (OnInstalledReason.INSTALL === details.reason) {
            browser.runtime.openOptionsPage()
        }
    })
})
