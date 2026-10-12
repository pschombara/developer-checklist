<script lang="ts" setup>

import CopiedToClipboard from '../mixed/CopiedToClipboard.vue'
import {computed, ref} from 'vue'
import {useJiraStorage} from '@/stores/jira'

const i18n = browser.i18n
const jiraStorage = useJiraStorage()

const text = {
    templates: i18n.getMessage('Templates'),
    preview: i18n.getMessage('Preview'),
    comment: i18n.getMessage('Comment'),
    copy: i18n.getMessage('Copy'),
    exportTicketData: i18n.getMessage('exportTicketData'),
}

const template = ref(null)
const message = ref()
const exportLink = ref()

const templates = computed(() => jiraStorage.getTemplates)

if (templates.value.length > 0) {
    template.value = templates.value[0]
}

const addComment = () => jiraStorage.addComment(template.value.id, false)

const copyComment = async () => {
    const blob = new Blob([await jiraStorage.replacePlaceholdersInComment(template.value.content)], {type: 'text/html'})
    await navigator.clipboard.write([new ClipboardItem({['text/html']: blob})])
    message.value.show()
}

// a download without the downloads permission, the same way the options export hands out its file
const exportTicketData = async () => {
    const data = await jiraStorage.exportIssue()

    if (null === data) {
        return
    }

    exportLink.value.download = `developer-checklist-${data.key}.json`
    exportLink.value.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 4))}`
    exportLink.value.click()
}
</script>

<template>
    <v-card class="mx-auto" flat>
        <v-card-text>
            <v-autocomplete
                v-model="template"
                :items="templates"
                item-title="title"
                return-object
                :label="text.templates"
                dense
            >
            </v-autocomplete>

            <h5 v-if="template">{{text.preview}}</h5>
            <pre
                v-if="template"
                style="max-height: 200px;"
                class="elevation-1 overflow-y-auto overflow-x-hidden py-4 px-2 text-pre-wrap"
            >{{template.content}}</pre>
        </v-card-text>
        <v-card-actions v-if="template">
            <v-spacer></v-spacer>
            <v-btn variant="outlined" color="primary" @click="addComment">{{ text.comment }}</v-btn>
            <v-btn variant="outlined" color="secondary" @click="copyComment"><v-icon>fas fa-copy</v-icon></v-btn>
            <v-btn
                variant="outlined"
                color="secondary"
                :title="text.exportTicketData"
                :aria-label="text.exportTicketData"
                @click="exportTicketData"
            ><v-icon>fas fa-file-export</v-icon></v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>

        <a v-show="false" ref="exportLink"></a>
        <copied-to-clipboard ref="message" />
    </v-card>
</template>
