<script setup>

import Helper from '../../../utils/helper'
import {useIssueStorage} from '../../../stores/issues.ts'
import {computed, ref} from 'vue'

const issueStorage = useIssueStorage()
const issueHeader = [
    {title: 'Identifier', key: 'key', sortable: false},
    {title: 'Title', key: 'title', sortable: false},
    {title: 'Last Update', key: 'date', align: 'end', sortable: false},
    {title: '', key: 'pinned', sortable: false},
    {title: '', key: 'action', align: 'end', sortable: false},
]

const i18n = browser.i18n

const text = {
    reload: i18n.getMessage('Reload'),
    cancel: i18n.getMessage('Cancel'),
    delete: i18n.getMessage('Delete'),
}

const load = ref(false)
const deleteIssue = ref({open: false, issue: null})
const issues = computed(() => issueStorage.getIssues)
const dateFormat = date => Helper.localeDate(date)
const reload = async () => {
    load.value = true
    await issueStorage.reloadFromStorage()
    load.value = false
}

const pin = issue => issueStorage.pin(issue.key)
const unpin = issue => issueStorage.unpin(issue.key)

const openDelete = item => deleteIssue.value = {open: true, issue: item.key}
const closeDelete = () => deleteIssue.value = {open: false, issue: null}
const remove = () => {
    issueStorage.removeIssue(deleteIssue.value.issue)
    closeDelete()
}

issueStorage.load()
</script>

<template>
    <v-card flat class="ml-5">
        <v-card-text>
            <v-data-table
                :items="issues"
                :headers="issueHeader"
                :sort-by="[{key: 'pinned', order: 'desc'}, {key: 'updateDate', order: 'desc'}]"
                multi-sort
                :loading="load"
            >
                <template #top>
                    <v-toolbar flat>
                        <v-spacer></v-spacer>
                        <v-btn variant="plain" prepend-icon="fas fa-sync" @click="reload">
                            {{ text.reload }}
                        </v-btn>
                        <v-dialog v-model="deleteIssue.open" max-width="450">
                            <v-card>
                                <v-card-title class="headline">
                                    {{ i18n.getMessage('TitleDelete', deleteIssue.issue) }}
                                </v-card-title>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="secondary" variant="plain" @click="closeDelete">{{ text.cancel }}</v-btn>
                                    <v-btn color="tertiary" variant="plain" @click="remove">{{ text.delete }}</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template #item.date="{item}">
                    {{ dateFormat(item.updateDate) }}
                </template>
                <template #item.pinned="{item}">
                    <v-btn
                        v-if="item.pinned"
                        variant="plain"
                        color="primary"
                        icon="fas fa-thumbtack"
                        size="small"
                        @click="unpin(item)"></v-btn>
                    <v-btn
                        v-else
                        variant="plain"
                        color="secondary"
                        icon="fas fa-thumbtack"
                        size="small"
                        class="rotate--45-inverted"
                        @click="pin(item)"></v-btn>
                </template>
                <template #item.action="{item}">
                    <v-btn
                        variant="plain"
                        icon="fas fa-trash"
                        color="tertiary"
                        size="small"
                        @click="openDelete(item)"> </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<style>
.rotate--45-inverted {
    transform: rotate(-45deg);
}
</style>
