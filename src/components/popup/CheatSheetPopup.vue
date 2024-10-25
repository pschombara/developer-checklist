<script setup>
import CopiedToClipboard from './mixed/CopiedToClipboard.vue'
import {computed, ref} from 'vue'
import {useCheatSheetStorage} from '../../stores/cheatSheet.ts'
import {useMainStorage} from '../../stores/mainStorage.ts'

const cheatSheetStorage = useCheatSheetStorage()
const mainStorage = useMainStorage()

const message = ref()
const search = ref('')

const i18n = browser.i18n

const text = {
    close: i18n.getMessage('Close'),
    copiedToClipboard: i18n.getMessage('copiedToClipboard'),
    label: i18n.getMessage('Label'),
    commandOrContent: i18n.getMessage('commandOrContent'),
}

const headers = [
    {title: text.label, key: 'label'},
    {title: text.commandOrContent, key: 'command'},
    {title: '', key: 'actions', align: 'end'},
]

const cheats = computed(() => cheatSheetStorage.getItems)
const itemsPerPage = computed(() => mainStorage.getDefaultPopupItemsPerPage)

const load = async () => {
    await cheatSheetStorage.load()
    await mainStorage.load()
}

const openOptions = tab => {
    mainStorage.changeMainTab(tab)
    browser.runtime.openOptionsPage()
}

const copy = async item => {
    await navigator.clipboard.writeText(item.command)
    message.value.show()
}

load()
</script>

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
                    <v-data-table
                        :headers="headers"
                        :items="cheats"
                        :items-per-page="itemsPerPage"
                        :search="search"
                    >
                        <template #top>
                            <v-toolbar flat rounded="sm">
                                <v-toolbar-title>
                                    <v-text-field
                                        v-model="search"
                                        prepend-icon="fas fa-search"
                                        clear-icon="fas fa-times"
                                        :label="text.search"
                                        single-line
                                        hide-details
                                        clearable
                                        density="compact"
                                        variant="underlined"
                                    />
                                </v-toolbar-title>
                            </v-toolbar>
                        </template>
                        <template #item.actions="{item}">
                            <v-btn
                                variant="plain"
                                icon="fas fa-copy"
                                size="small"
                                @click="copy(item)"></v-btn>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-card-text>
        <copied-to-clipboard ref="message"></copied-to-clipboard>
    </v-card>
</template>
