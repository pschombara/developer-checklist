<template>
    <v-card v-if="optionsValid">
        <v-card-title>
            <v-row>
                <v-col cols="10">Embeddable Build Status</v-col>
                <v-col cols="2">
                    <v-btn variant="text" @click="openOptions('jenkins')"><v-icon>fas fa-cog</v-icon></v-btn>
                </v-col>
            </v-row>
        </v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="8">
                    <v-autocomplete
                        v-model="job"
                        :items="builds"
                        item-value="job"
                        item-title="name"
                        label="Job"
                        variant="underlined"
                    ></v-autocomplete>
                </v-col>
                <v-col cols="4">
                    <v-text-field
                        v-model="build"
                        type="number"
                        min="1"
                        label="Build Number"
                        variant="underlined"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row class="mt-0">
                <v-col cols="10">
                    <v-text-field
                        ref="copyBuild"
                        readonly
                        :value="buildUrl"
                        :disabled="!readyToCopy"
                        variant="solo"
                        density="compact"
                        @click="copy"
                    ></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-btn
                        block
                        color="primary"
                        :disabled="!readyToCopy"
                        @click="copy"
                    ><v-icon small>fas fa-copy</v-icon></v-btn>
                </v-col>
            </v-row>
            <v-row class="mt-0">
                <v-col cols="12">
                    <v-data-table
                        v-if="issueData"
                        :items="issueData.ciBuilds"
                        :headers="issueHeader"
                        :items-per-page="3"
                        :footer-props="{disableItemsPerPage: true, itemsPerPageOptions:[3]}"
                    >
                        <template #top>
                            <v-toolbar flat>
                                <v-toolbar-title>
                                    <v-autocomplete
                                        v-model="issue"
                                        :items="issues"
                                        item-title="name"
                                        item-value="name"
                                        label="Attach to Issue"
                                        class="mt-5"
                                        density="comfortable"
                                        variant="underlined"
                                    ></v-autocomplete>
                                </v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-tooltip location="bottom">
                                    <template #activator="{props}">
                                        <v-btn
                                            variant="plain"
                                            color="primary"
                                            :disabled="!readyToCopy || null === issue"
                                            icon="fas fa-plus"
                                            size="small"
                                            v-bind="props"
                                            @click="attachToIssue"
                                        ></v-btn>
                                    </template>
                                    <span>{{ text.helpAddIssue }}</span>
                                </v-tooltip>
                                <v-tooltip location="bottom">
                                    <template #activator="{props}">
                                        <v-btn
                                            variant="plain"
                                            color="secondary"
                                            :disabled="!readyToCopy || null === issue"
                                            icon="fas fa-arrow-right-arrow-left"
                                            @click="exchangeInIssue"
                                        ></v-btn>
                                    </template>
                                    <span>{{ text.helpReplaceIssue }}</span>
                                </v-tooltip>

                            </v-toolbar>
                        </template>
                        <template #item.job="{item}">
                            {{buildName(item.job)}}
                        </template>
                        <template #item.action="{item}">
                            <v-btn variant="plain" icon="fas fa-copy" size="small" @click="copyBuild(item.job, item.build)">
                            </v-btn>
                            <v-btn variant="plain" icon="fas fa-external-link-alt" size="small" @click="openBuild(item.job, item.build)">
                            </v-btn>
                            <v-btn variant="plain" icon="fas fa-trash" size="small" color="tertiary" @click="removeFromIssue(item.job, item.build)">
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
            <v-btn color="primary" plain @click="openOptions('jenkins')">{{i18n.getMessage('openOptions')}}</v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>
    </v-card>
</template>

<script>
import _ from 'lodash'
import CopiedToClipboard from './mixed/CopiedToClipboard.vue'

export default {
    name: 'PopupJenkins',
    components: {CopiedToClipboard},
    data: () => {
        return {
            job: '',
            build: null,
            i18n: chrome.i18n,
            optionsValid: false,
            issue: null,
            issues: [],
            text: {
                helpAddIssue: chrome.i18n.getMessage('helpAddIssue'),
                helpReplaceIssue: chrome.i18n.getMessage('helpReplaceIssue'),
            },
        }
    },
    computed: {
        builds: function () {
            return this.$store.getters['jenkins/getBuilds']
        },
        readyToCopy: function () {
            const host = this.$store.getters['jenkins/getHost']

            return '' !== host && '' !== this.job && null !== this.build && '' !== this.build
        },
        buildUrl: function () {
            if (false === this.readyToCopy) {
                return ''
            }

            return this.$store.getters['jenkins/url'](this.job, this.build, true)
        },
        issueData: function () {
            return this.$store.getters['issues/issue'](this.issue)
        },
        issueHeader: function () {
            return [
                { title: 'Job', key: 'job'},
                { title: 'Build', key: 'build'},
                { title: '', key: 'action', sortable: false, align: 'end'},
            ]
        },
    },
    created() {
        this.optionsValid = '' !== this.$store.getters['jenkins/getHost']
            && 0 < this.$store.getters['jenkins/getBuilds'].length

        if (false === this.optionsValid) {
            return
        }

        this.$store.dispatch('jenkins/checkUrl').then(() => {
            this.job = this.$store.getters['jenkins/currentJob']
            this.build = this.$store.getters['jenkins/currentBuild']
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
    methods: {
        openOptions: function (tab) {
            this.$store.dispatch('changeMainTab', tab)
            chrome.runtime.openOptionsPage()
        },
        copy: function () {
            if (this.readyToCopy) {
                let blob = new Blob([this.$refs.copyBuild.value], {type: 'text/html'})

                navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})])
                    .then(() => {
                        this.$refs.message.show()
                    })
            }
        },
        attachToIssue: function () {
            this.$store.dispatch('issues/attachCiBuild', {
                issue: this.issue,
                job: this.job,
                build: this.build,
            })
        },
        exchangeInIssue: function () {
            this.$store.dispatch('issues/exchangeCiBuild', {
                issue: this.issue,
                job: this.job,
                build: this.build,
            })
        },
        removeFromIssue: function (job, build) {
            this.$store.dispatch('issues/removeCiBuild', {
                issue: this.issue,
                job,
                build,
            })
        },
        buildName: function (job) {
            const ciJob = this.builds.find(build => build.job === job)

            if (undefined === ciJob) {
                return ''
            }

            return '' !== ciJob.label ? ciJob.label : ciJob.name
        },
        openBuild: function (job, build) {
            const url = this.$store.getters['jenkins/url'](job, build,false)

            if ('' === url) {
                return
            }

            chrome.tabs.create({url})
        },
        copyBuild: function (job, build) {
            const url = this.$store.getters['jenkins/url'](job, build,true)

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
}
</script>
