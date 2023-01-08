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
                        :items="builds"
                        item-value="job"
                        item-title="name"
                        v-model="job"
                        label="Job"
                        dense
                    ></v-autocomplete>
                </v-col>
                <v-col cols="4">
                    <v-text-field
                        type="number"
                        min="1"
                        v-model="build"
                        label="Build Number"
                        dense
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row class="mt-0">
                <v-col cols="10">
                    <v-text-field
                        outlined
                        readonly
                        ref="copyBuild"
                        :value="buildUrl"
                        @click="copy"
                        :disabled="!readyToCopy"
                        dense
                    ></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-btn
                        block
                        color="success"
                        @click="copy"
                        :disabled="!readyToCopy"
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
                                    color="success"
                                    @click="attachToIssue"
                                    :disabled="!readyToCopy || null === issue"
                                ><v-icon small>fas fa-plus</v-icon></v-btn>
                            </v-toolbar>
                        </template>
                        <template v-slot:item.job="{item}">
                            {{buildName(item.job)}}
                        </template>
                        <template v-slot:item.action="{item}">
                            <v-btn icon small @click="copyBuild(item.job, item.build)">
                                <v-icon small>fas fa-copy</v-icon>
                            </v-btn>
                            <v-btn icon small @click="openBuild(item.job, item.build)">
                                <v-icon small>fas fa-external-link-alt</v-icon>
                            </v-btn>
                            <v-btn icon @click="removeFromIssue(item.job, item.build)" small>
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
            <v-btn color="primary" plain @click="openOptions('jenkins')">{{i18n.getMessage('openOptions')}}</v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>
    </v-card>
</template>

<script>
import _ from 'lodash'
import CopiedToClipboard from '@/components/popup/mixed/CopiedToClipboard.vue'

export default {
    name: 'PopupJenkins',
    components: {CopiedToClipboard},
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
                { title: 'Job', value: 'job'},
                { title: 'Build', value: 'build'},
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
                let blob = new Blob([this.$refs.copyBuild.$refs.input.value], {type: 'text/html'})

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
    data: () => {
        return {
            job: '',
            build: null,
            i18n: chrome.i18n,
            optionsValid: false,
            issue: null,
            issues: [],
        }
    },
}
</script>
