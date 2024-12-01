<script lang="ts" setup>

import {computed, ref} from 'vue'
import {useIssueStorage} from '@/stores/issues.js'
import {useJiraStorage} from '@/stores/jira.js'

const i18n = browser.i18n
const text = {
    lastOpened: i18n.getMessage('lastOpenedIssues'),
    open: i18n.getMessage('openIssue'),
    pinned: i18n.getMessage('pinned'),
}
const issueStorage = useIssueStorage()
const jiraStorage = useJiraStorage()

const issues = computed(() => {
    let issues = [...issueStorage.getIssues]

    issues = issues.sort((a, b) => {
        if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1
        }

        return a.updateDate > b.updateDate ? -1 : 1
    })

    return issues.slice(0, jiraStorage.getMaximumIssues)
})

const maximumIssues = computed(() => jiraStorage.getMaximumIssues)
const jiraUrl = computed(() => jiraStorage.getUrl)
const boards = computed(() => jiraStorage.getBoards.map(board => board.key))
const board = ref('')

const openIssue = issueNumber => browser.tabs.create({url: `${jiraUrl.value}/browse/${issueNumber}`})
const issueNumber = ref(null)

const checkButtonEnabled = () => '' !== (issueNumber.value ?? '') && boards.value.includes(board.value ?? '')

const open = () => {
    if (false === checkButtonEnabled()) {
        return
    }

    openIssue(`${board.value}-${issueNumber.value}`)
}

board.value = jiraStorage.getBoards.find(board => board.default).key

const buttonColor = item => item.pinned ? 'primary' : 'secondary'

jiraStorage.load()
issueStorage.load()
</script>

<template>
    <v-card>
        <v-card-text>
            <v-row>
                <v-col><h3>{{ text.open }}</h3></v-col>
            </v-row>
            <v-row class="d-flex align-center mt-0">
                <v-col cols="5">
                    <v-combobox v-model="board" :items="boards" variant="underlined"></v-combobox>
                </v-col>
                <v-col cols="5">
                    <v-text-field
                        v-model="issueNumber"
                        type="number"
                        min="1"
                        variant="underlined"
                        autofocus="autofocus"
                        @enter="open"
                    ></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-btn color="primary" :disabled="!checkButtonEnabled()" @click="open">GO</v-btn>
                </v-col>
            </v-row>
            <v-row v-if="maximumIssues > 0 && issues.length > 0">
                <v-col><h3>{{text.lastOpened}}</h3></v-col>
            </v-row>
            <v-row  class="mt-3">
                <template v-for="issue in issues" :key="issue.id">
                    <v-col cols="4">
                        <v-btn :color="buttonColor(issue)" block="block" @click="openIssue(issue.key)">
                            {{issue.key}}
                        </v-btn>
                    </v-col>
                </template>
            </v-row>
        </v-card-text>
    </v-card>
</template>
