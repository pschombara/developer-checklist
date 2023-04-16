export default class Theme {
    constructor() {
        this.registered = false
        this.schema = 'system'
        this.color = 'blue'
    }
    registerThemeChanged(vue, schema, color) {
        this.schema = schema
        this.color = color

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if ('system' !== this.schema) {
                return
            }

            vue.$vuetify.theme.global.name = this.color + (e.matches ? 'Dark' : 'Light')
        })

        this.registered = true
    }

    changeSchema(schema) {
        this.schema = schema
    }

    changeColor(color) {
        this.color = color
    }
}
