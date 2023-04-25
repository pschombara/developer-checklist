<template>
    <v-card>
        <v-card-title>
            <v-row>
                <v-col cols="10">Cheat Sheet</v-col>
                <v-col cols="2">
                    <v-btn variant="text" @click="openOptions('cheatSheet')"><v-icon>fas fa-cog</v-icon></v-btn>
                </v-col>
            </v-row>
        </v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="12">
                    <v-autocomplete
                        v-model="command"
                        :items="cheats"
                        item-title="label"
                        item-value="command"
                        variant="underlined"
                    ></v-autocomplete>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="10">
                    <v-text-field
                        ref="copyCommand"
                        readonly
                        :disabled="'' === command"
                        :value="command"
                        variant="solo"
                        density="compact"
                        @click="copy"
                    ></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-btn
                        block
                        x-large
                        variant="outlined"
                        color="primary"
                        :disabled="'' === command"
                        @click="copy"
                    >
                        <v-icon>fas fa-copy</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>
        <copied-to-clipboard ref="message"></copied-to-clipboard>
    </v-card>
</template>

<script>
import CopiedToClipboard from './mixed/CopiedToClipboard.vue'

export default {
    name: 'PopupCheatSheet',
    components: {CopiedToClipboard},
    data: () => {
        return {
            command: '',
            hint: false,
            text: {
                close: chrome.i18n.getMessage('Close'),
                copiedToClipboard: chrome.i18n.getMessage('copiedToClipboard'),
            },
        }
    },
    computed: {
        cheats: function () {
            return this.$store.getters['cheatSheet/getItems']
        },
    },
    methods: {
        openOptions: function (tab) {
            this.$store.dispatch('changeMainTab', tab)
            chrome.runtime.openOptionsPage()
        },
        copy: function () {
            navigator.clipboard.writeText(this.$refs.copyCommand.value)
            this.$refs.message.show()
        },
    },
}
</script>
