export default class Theme {
    constructor() {
        this.registered = false
    }
    registerThemeChanged(vue) {
        if (this.registered) {
            return
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            vue.$vuetify.theme.dark = e.matches
        })

        this.registered = true
    }
}
