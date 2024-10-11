<script setup>
import _ from 'lodash'
import CopiedToClipboard from './mixed/CopiedToClipboard.vue'
import {computed, ref} from 'vue'
import {useJenkinsStorage} from '../../stores/jenkins.js'
import {useIssueStorage} from '../../stores/issues.js'
import {useMainStorage} from '../../stores/mainStorage.js'

const i18n = chrome.i18n
const optionsValid = ref(false)
const issue = ref(null)
const message = ref()
const copyBuildUrl = ref()
const build = ref()
const job = ref()

const text = {
    helpAddIssue: i18n.getMessage('helpAddIssue'),
    helpReplaceIssue: i18n.getMessage('helpReplaceIssue'),
}

const issueHeader = [
    { title: 'Job', key: 'job'},
    { title: 'Build', key: 'build'},
    { title: '', key: 'action', sortable: false, align: 'end'},
]

const jenkinsStorage = useJenkinsStorage()
const issueStorage = useIssueStorage()
const mainStorage = useMainStorage()

const issues = computed(() => {
    const data = _.cloneDeep(issueStorage.getIssues)

    data.sort((a, b) => {
        if (a.work || b.work) {
            return a.work ? -1 : 1
        }

        if ((a.pinned || b.pinned) && (a.pinned !== b.pinned)) {
            return a.pinned ? -1 : 1
        }

        return a.date > b.date ? -1 : 1
    })

    return data
})

const itemsPerPage = computed(() => mainStorage.getDefaultPopupItemsPerPage)

const builds = computed(() => {
    return jenkinsStorage.getBuilds
})

const readyToCopy = computed(() => {
    const host = jenkinsStorage.getHost

    return '' !== host && '' !== job.value && '' !== (build.value ?? '')
})

const issueData = computed(() => {
    return issueStorage.getIssue(issue.value)
})

const buildUrl = computed(() => {
    if (false === readyToCopy.value) {
        return ''
    }

    return jenkinsStorage.buildUrl(job.value, build.value, true)
})

const load = async () => {
    await issueStorage.load()
    await jenkinsStorage.load()

    optionsValid.value = jenkinsStorage.getHost && 0 < jenkinsStorage.getBuilds.length

    if (false === optionsValid.value) {
        return
    }

    await jenkinsStorage.checkUrl()

    build.value = jenkinsStorage.getCurrentBuild
    job.value = jenkinsStorage.getCurrentJob

    if (issues.value.length > 0 ) {
        issue.value = issues.value[0].key
    }
}

const openOptions = tab => {
    mainStorage.changeMainTab(tab)
    chrome.runtime.openOptionsPage()
}

const copy = async () => {
    if (readyToCopy.value) {
        const blob = new Blob([copyBuildUrl.value.value], {type: 'text/html'})

        await navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})])

        message.value.show()
    }
}

const attachToIssue = () => issueStorage.addCiBuild(issue.value, job.value, build.value)
const exchangeInIssue = () => issueStorage.exchangeCiBuild(issue.value, job.value, build.value)

const removeFromIssue = (job, ciBuild) => issueStorage.removeCiBuild(issue.value, job, ciBuild)

const jobName = job => {
    const ciJob = builds.value.find(item => item.job === job)

    if (undefined === ciJob) {
        return ''
    }

    return '' !== ciJob.label ? ciJob.label : ciJob.name
}

const openBuild = (job, build) => {
    const url = jenkinsStorage.buildUrl(job, build, false)

    if ('' === url) {
        return
    }

    chrome.tabs.create({url})
}

const copyBuild = async (job, build) => {
    const url = jenkinsStorage.buildUrl(job, build, false)

    if ('' === url) {
        return
    }

    const blob = new Blob([url], {type: 'text/html'})

    await navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})])

    message.value.show()
}

load()
</script>
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
                        ref="copyBuildUrl"
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
                        :items-per-page="itemsPerPage"
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
                                    <template #activator="{}">
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
                            {{jobName(item.job)}}
                        </template>
                        <template #item.action="{item}">
                            <v-btn variant="plain" icon="fas fa-copy" size="small" @click="copyBuild(item.job, item.build)" />
                            <v-btn variant="plain" icon="fas fa-external-link-alt" size="small" @click="openBuild(item.job, item.build)" />
                            <v-btn variant="plain" icon="fas fa-trash" size="small" color="tertiary" @click="removeFromIssue(item.job, item.build)" />
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
