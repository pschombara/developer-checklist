<template>
    <v-snackbar
        v-model="visible"
        :timeout="2200"
    >
        <v-icon left color="success">fas fa-check</v-icon>
        {{text.copiedToClipboard}}

        <template v-slot:action="{ attrs }">
            <v-btn
                color="blue"
                text
                v-bind="attrs"
                @click="visible = false"
            >
                {{text.close}}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script>
export default {
    name: 'CopiedToClipboard',
    data: () => {
        return {
            text: {
                close: chrome.i18n.getMessage('Close'),
                copiedToClipboard: chrome.i18n.getMessage('copiedToClipboard'),
            },
            visible: false,
        }
    },
    methods: {
        show: function () {
            this.visible = true
        },
    },
}
</script>

<style scoped>

</style>
