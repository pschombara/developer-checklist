<template>
    <v-card flat class="ml-5">
        <v-card-text>
            <v-data-table
                :items="issues"
                :headers="issueHeader"
                :sort-by="['pinned', 'updateDate']"
                :sort-desc="[true, true]"
                multi-sort
                :loading="load"
            >
                <template #top>
                    <v-toolbar flat>
                        <v-spacer></v-spacer>
                        <v-btn plain @click="reload">
                            <v-icon left>fas fa-sync</v-icon>
                            {{ text.reload }}
                        </v-btn>

                        <v-dialog v-model="deleteIssue.open" max-width="450">
                            <v-card>
                                <v-card-title class="headline">
                                    {{ i18n.getMessage('TitleDelete', deleteIssue.issue) }}
                                </v-card-title>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="secondary" plain @click="closeDelete">{{ text.cancel }}</v-btn>
                                    <v-btn color="tertiary" plain @click="remove">{{ text.delete }}</v-btn>
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
                        v-if="item.raw.pinned"
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
                        small
                        @click="openDelete(item)"> </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>

import Helper from '../../../mixins/helper'

export default {
    name: 'JiraIssues',
    data: () => {
        return {
            text: {
                reload: chrome.i18n.getMessage('Reload'),
                cancel: chrome.i18n.getMessage('Cancel'),
                delete: chrome.i18n.getMessage('Delete'),
            },
            load: false,
            deleteIssue: {
                open: false,
                issue: null,
            },
            i18n: chrome.i18n,
        }
    },
    computed: {
        issueHeader() {
            return [
                {title: 'Identifier', key: 'name', sortable: false},
                {title: 'Title', key: 'title', sortable: false},
                {title: 'Last Update', key: 'date', align: 'end', sortable: false},
                {title: '', key: 'pinned', sortable: false},
                {title: '', key: 'action', align: 'end', sortable: false},
            ]
        },
        issues() {
            return this.$store.getters['issues/list']
        },
    },
    methods: {
        reload: function () {
            this.load = true
            this.$store.dispatch('issues/reloadFromStorage').then(() => {
                this.load = false
            })
        },
        pin: function (issue) {
            this.$store.dispatch('issues/pin', issue.raw.name)
        },
        unpin: function (issue) {
            this.$store.dispatch('issues/unpin', issue.raw.name)
        },
        openDelete: function (item) {
            this.deleteIssue = {
                open: true,
                issue: item.raw.name,
            }
        },
        closeDelete: function () {
            this.deleteIssue = {
                open: false,
                issue: null,
            }
        },
        remove: function () {
            this.$store.dispatch('issues/removeIssue', this.deleteIssue.issue)
            this.closeDelete()
        },
        dateFormat: function (date) {
            return Helper.localeDate(date)
        },
    },
}
</script>

<style>
.rotate--45-inverted {
    transform: rotate(-45deg);
}
</style>
