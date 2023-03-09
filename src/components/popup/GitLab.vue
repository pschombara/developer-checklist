<template>
    <v-card v-if="optionsValid">
        <v-card-title>
            <v-row>
                <v-col cols="10">Merge Requests</v-col>
                <v-col cols="2">
                    <v-btn variant="text" @click="openOptions('gitLab')"><v-icon>fas fa-cog</v-icon></v-btn>
                </v-col>
            </v-row>
        </v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="8">
                    <v-autocomplete
                        :items="projects"
                        item-value="uuid"
                        item-title="project"
                        v-model="project"
                        :label="text.project"
                        dense
                    ></v-autocomplete>
                </v-col>
                <v-col cols="4">
                    <v-text-field
                        type="number"
                        min="1"
                        v-model="number"
                        label="Merge Number"
                        dense
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row class="mt-0">
                <v-col cols="10">
                    <v-text-field
                        outlined
                        readonly
                        ref="copyMergeUrl"
                        :value="mergeUrl"
                        @click="copy"
                        :disabled="!readyToCopy"
                        dense
                    ></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-btn
                        block
                        color="primary"
                        @click="copy"
                        :disabled="!readyToCopy"
                    ><v-icon small>fas fa-copy</v-icon></v-btn>
                </v-col>
            </v-row>
            <v-row class="mt-0">
                <v-col cols="12">
                    <v-data-table
                        v-if="issueData"
                        :items="issueData.mergeRequests"
                        :headers="issueHeader"
                        :items-per-page="3"
                        :footer-props="{disableItemsPerPage: true, itemsPerPageOptions:[3]}"
                    >
                        <template v-slot:top>
                            <v-toolbar flat>
                                <v-autocomplete
                                    :items="issues"
                                    item-title="name"
                                    item-value="name"
                                    v-model="issue"
                                    label="Attach to Issue"
                                    class="mt-7"
                                ></v-autocomplete>
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="primary"
                                    @click="attachToIssue"
                                    :disabled="!readyToCopy || null === issue"
                                ><v-icon small>fas fa-plus</v-icon></v-btn>
                            </v-toolbar>
                        </template>
                        <template v-slot:item.id="{item}">
                            {{ projectName(item.id) }}
                        </template>
                        <template v-slot:item.action="{item}">
                            <v-btn icon small @click="copyMergeRequest(item.id, item.number, item.source)">
                                <v-icon small>fas fa-copy</v-icon>
                            </v-btn>
                            <v-btn icon small @click="openMergeRequest(item.id, item.number)">
                                <v-icon small>fas fa-external-link-alt</v-icon>
                            </v-btn>
                            <v-btn icon @click="removeFromIssue(item.id, item.number)" small>
                                <v-icon color="red darken-2" small>fas fa-trash</v-icon>
                            </v-btn>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-card-text>
        <copied-to-clipboard ref="message"></copied-to-clipboard>
    </v-card>
    <v-card v-else>
        <v-card-text>
            Missing Options
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" plain @click="openOptions('gitLab')">{{text.openOptions}}</v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>
    </v-card>
</template>

<script>
import _ from 'lodash'
import CopiedToClipboard from '@/components/popup/mixed/CopiedToClipboard.vue'

export default {
    name: 'PopupGitLab',
    components: {CopiedToClipboard},
    created() {
        this.optionsValid = '' !== this.$store.getters['gitLab/getHost']
            && 0 < this.$store.getters['gitLab/getProjects'].length

        if (false === this.optionsValid) {
            return
        }

        this.$store.dispatch('gitLab/checkUrl').then(() => {
            this.project = this.$store.getters['gitLab/currentProject']
            this.number = this.$store.getters['gitLab/currentNumber']
        })

        this.issues = _.cloneDeep(this.$store.getters['issues/list'])

        this.issues.sort(function (a, b) {
            if (a.work || b.work) {
                return a.work ? -1 : 1
            }

            if ((a.pinned || b.pinned) && a.pinned !== b.pinned) {
                return a.pinned ? -1 : 1
            }

            return a.date > b.date ? -1 : 1
        })

        if (this.issues.length > 0) {
            this.issue = this.issues[0].name
        }
    },
    computed: {
        projects: function () {
            return this.$store.getters['gitLab/getProjects']
        },
        readyToCopy: function () {
            const host = this.$store.getters['gitLab/getHost']

            return '' !== host && '' !== this.project && null !== this.number && '' !== this.number
        },
        mergeUrl: function () {
            if (false === this.readyToCopy) {
                return ''
            }

            const source = this.$store.getters['gitLab/currentSource']

            return this.$store.getters['gitLab/url'](this.project, this.number, source, true)
        },
        issueData: function () {
            return this.$store.getters['issues/issue'](this.issue)
        },
        issueHeader: function () {
            return [
                { title: 'Project', value: 'id'},
                { title: 'Number', value: 'number'},
                { title: '', value: 'action', sortable: false, align:'right'},
            ]
        },
    },
    methods: {
        openOptions: function (tab) {
            this.$store.dispatch('changeMainTab', tab)
            chrome.runtime.openOptionsPage()
        },
        copy: function () {
            if (this.readyToCopy) {
                let blob = new Blob([this.$refs.copyMergeUrl.$refs.input.value], {type: 'text/html'})

                navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})])
                    .then(() => {
                        this.$refs.message.show()
                    })
            }
        },
        attachToIssue: function () {
            this.$store.dispatch('issues/attachMergeRequest', {
                issue: this.issue,
                id: this.project,
                number: this.number,
                source: this.$store.getters['gitLab/currentSource'] ?? '',
            })
        },
        removeFromIssue: function (id, number) {
            this.$store.dispatch('issues/removeMergeRequest', {
                issue: this.issue,
                id,
                number,
            })
        },
        projectName: function (id) {
            return this.projects.find(project => project.uuid === id).project
        },
        openMergeRequest: function (id, number) {
            const url = this.$store.getters['gitLab/url'](id, number, '', false)

            if ('' === url) {
                return
            }

            chrome.tabs.create({url})
        },
        copyMergeRequest: function (id, number, source) {
            const url = this.$store.getters['gitLab/url'](id, number, source, true)

            if ('' === url) {
                return
            }

            let blob = new Blob([url], {type: 'text/html'})

            navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})])
                .then(() => {
                    this.$refs.message.show()
                })
        },
    },
    data: () => {
        return {
            optionsValid: true,
            i18n: chrome.i18n,
            text: {
                openOptions: chrome.i18n.getMessage('openOptions'),
                project: chrome.i18n.getMessage('Project'),
            },
            project: '',
            number: null,
            issue: null,
            issues: [],
        }
    },
}
</script>
