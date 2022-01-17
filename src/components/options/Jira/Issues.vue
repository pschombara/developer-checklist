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
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-spacer></v-spacer>
                        <v-btn plain @click="reload"><v-icon left>fas fa-sync</v-icon> {{text.reload}}</v-btn>

                        <v-dialog v-model="deleteIssue.open" max-width="450">
                            <v-card>
                                <v-card-title class="headline">
                                    {{ i18n.getMessage('TitleDelete', deleteIssue.issue) }}
                                </v-card-title>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="grey" plain @click="closeDelete">{{ text.cancel }}</v-btn>
                                    <v-btn color="error" plain @click="remove">{{ text.delete }}</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template v-slot:item.date="{item}">
                    {{dateFormat(item.updateDate)}}
                </template>
                <template v-slot:item.pinned="{item}">
                    <v-btn color="success" v-if="item.pinned" icon @click="unpin(item)" small><v-icon small>fas fa-thumbtack</v-icon></v-btn>
                    <v-btn color="grey" v-else icon @click="pin(item)" small><v-icon small>fas fa-thumbtack rotate--45-inverted</v-icon></v-btn>
                </template>
                <template v-slot:item.action="{item}">
                    <v-btn icon color="red darken-2" small @click="openDelete(item)"><v-icon small>fas fa-trash</v-icon></v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>

import Helper from '../../../mixins/helper'

export default {
    name: 'Issues',
    methods: {
        reload: function () {
            this.load = true
            this.$store.dispatch('issues/reloadFromStorage').then(() => {
                this.load = false
            })
        },
        pin: function (issue) {
            this.$store.dispatch('issues/pin', issue.name)
        },
        unpin: function (issue) {
            this.$store.dispatch('issues/unpin', issue.name)
        },
        openDelete: function (item) {
            this.deleteIssue = {
                open: true,
                issue: item.name,
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
    computed: {
        issueHeader() {
            return [
                {text: 'Identifier', value: 'name', sortable: false},
                {text: 'Title', value: 'title', sortable: false},
                {text: 'Last Update', value: 'date', align: 'end', sortable: false},
                {text: '', value: 'pinned', sortable: false},
                {text: '', value: 'action', align: 'end', sortable: false},
            ]
        },
        issues() {
            return this.$store.getters['issues/list']
        },
    },
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
}
</script>

<style>
.rotate--45-inverted {
    transform: rotate(-45deg);
}
</style>
