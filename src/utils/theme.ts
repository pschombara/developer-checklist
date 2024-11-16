import vuetify from './plugins/vuetify.ts'
import themes from 'plugins/themes.ts'

export default class Theme {
    private registered: boolean;
    private schema: string;
    private color: string;

    constructor() {
        this.registered = false
        this.schema = 'system'
        this.color = 'blue'
    }
    registerThemeChanged(schema: string, color: string) {
        this.schema = schema
        this.color = color

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if ('system' !== this.schema) {
                return
            }

            vuetify.theme.global.name = this.color + (e.matches ? 'Dark' : 'Light')
        })

        this.registered = true
    }

    changeSchema(schema: string) {
        this.schema = schema
    }

    changeColor(color: string) {
        this.color = color
    }
}
