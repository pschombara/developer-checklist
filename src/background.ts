export default defineBackground(() => {
    browser.runtime.onInstalled.addListener(details => {
        if ('installed' === details.reason) {
            browser.runtime.openOptionsPage()
        }
    })
})
