<script setup>
import _ from 'lodash'
import CopiedToClipboard from './mixed/CopiedToClipboard.vue'
import {useGitLabStorage} from '../../stores/gitlab.js'
import {computed, ref} from 'vue'
import {useMainStorage} from '../../stores/mainStorage.js'
import {useIssueStorage} from '../../stores/issues.js'
import {useJenkinsStorage} from '../../stores/jenkins.js'
import ProjectSettings from '../shared/GitLab/ProjectSettings.vue'

const gitlabStorage = useGitLabStorage()
const mainStorage = useMainStorage()
const issueStorage = useIssueStorage()
const jenkinsStorage = useJenkinsStorage()

const i18n = chrome.i18n
const text = {
    openOptions: i18n.getMessage('openOptions'),
    project: i18n.getMessage('Project'),
    add: i18n.getMessage('Add'),
}

const issueHeader = [
    { title: 'Project', key: 'id'},
    { title: 'Number', key: 'number'},
    { title: '', key: 'action', sortable: false, align:'end'},
]

const optionsValid = ref(false)
const project = ref('')
const number = ref(null)
const issue = ref(null)
const copyMergeUrl = ref()
const message = ref()
const autodetect = ref(false)
const autoProject = ref()
const onHost = ref(false)

const defaultAutoProject = {
    title: '',
    item: {
        domain: null,
        project: null,
        uuid: null,
        ciBuild: null,
    },
    current: null,
    saveButton: text.add,
}

const itemsPerPage = computed(() => mainStorage.getDefaultPopupItemsPerPage)
const projects = computed(() => gitlabStorage.getProjects)
const readyToCopy = computed(() => {
    const host = gitlabStorage.getHost

    return '' !== host && '' !== project.value && '' !== (number.value ?? '')
})

const mergeUrl = computed(() => {
    if (false === readyToCopy.value) {
        return ''
    }

    const source = gitlabStorage.getCurrentSource

    return gitlabStorage.buildUrl(project.value, number.value, source, true)
})

const issueData = computed(() => issueStorage.getIssue(issue.value))

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

const load = async () => {
    await gitlabStorage.load()
    await issueStorage.load()
    await mainStorage.load()
    await jenkinsStorage.load()

    optionsValid.value = '' !== gitlabStorage.getHost && gitlabStorage.getProjects.length > 0

    if (false === optionsValid.value) {
        return
    }

    onHost.value = await gitlabStorage.onHost()
    await gitlabStorage.checkUrl()

    project.value = gitlabStorage.currentProject
    number.value = gitlabStorage.currentNumber

    if (issues.value.length > 0) {
        issue.value = issues.value[0].key
    }
}

const openOptions = tab => {
    mainStorage.changeMainTab(tab)
    chrome.runtime.openOptionsPage()
}

const copy = async () => {
    if (false === readyToCopy.value) {
        return
    }

    const blob = new Blob([copyMergeUrl.value.value], {type: 'text/html'})
    await navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})])
    message.value.show()
}

const attachToIssue = () => issueStorage.addMergeRequest(issue.value, project.value, number.value, gitlabStorage.getCurrentSource ?? '')
const removeFromIssue = (id, number) => issueStorage.removeMergeRequest(issue.value, id, number)
const projectName = id => gitlabStorage.getProject(id)?.project

const openMergeRequest = (id, number) => {
    const url = gitlabStorage.buildUrl(id, number, '', false)

    if ('' === url) {
        return
    }

    chrome.tabs.create({url})
}

const copyMergeRequest = async (id, number, source) => {
    const url = gitlabStorage.buildUrl(id, number, source, true)

    if ('' === url) {
        return
    }

    const blob = new Blob([url], {type: 'text/html'})

    await navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})])
    message.value.show()
}

const openJenkinsParamPage = (projectId, branch) => {
    const project = projects.value.find(item => item.uuid === projectId)
    const ciBuild = jenkinsStorage.getBuilds.find(item => item.uuid === project.ciBuild)
    const host = jenkinsStorage.getHost

    if (undefined === ciBuild || '' === host) {
        return
    }

    const url = `${host}job/${ciBuild.job}/parambuild?delay=0sec&branch=${branch}`

    chrome.tabs.create({url})
}

const hasCiBuild = projectId => {
    const project = projects.value.find(item => item.uuid === projectId)

    return undefined !== jenkinsStorage.getBuilds.find(item => item.uuid === project.ciBuild)
}

const openDetect = async () => {
    autoProject.value = {...defaultAutoProject}

    const detectedData = await gitlabStorage.autoDetect()

    if (null === detectedData) {
        return
    }

    autoProject.value.item.domain = detectedData.category
    autoProject.value.item.project = detectedData.project

    autodetect.value = true
}

const closeDetect = async () => {
    await gitlabStorage.save()
    await gitlabStorage.checkUrl()
    project.value = gitlabStorage.currentProject
    number.value = gitlabStorage.currentNumber

    autodetect.value = false
}

load()
</script>

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
        <v-card-text v-if="!autodetect">
            <v-row>
                <v-col cols="8">
                    <v-autocomplete
                        v-model="project"
                        :items="projects"
                        item-value="uuid"
                        item-title="project"
                        :label="text.project"
                        variant="underlined"
                    ></v-autocomplete>
                </v-col>
                <v-col cols="4">
                    <v-text-field
                        v-model="number"
                        type="number"
                        min="1"
                        label="Merge Number"
                        variant="underlined"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row v-if="project" class="mt-0">
                <v-col cols="10">
                    <v-text-field
                        ref="copyMergeUrl"
                        readonly
                        :value="mergeUrl"
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
            <v-row v-else-if="onHost">
                <v-col cols="12"><h3>Project Not found?</h3></v-col>
                <v-col class="mb-3" cols="12"><v-btn @click="openDetect">Autodetect</v-btn></v-col>
            </v-row>
            <v-row class="mt-0">
                <v-col cols="12">
                    <v-data-table
                        v-if="issueData"
                        :items="issueData.mergeRequests"
                        :headers="issueHeader"
                        :items-per-page="itemsPerPage"
                    >
                        <template #top>
                            <v-toolbar flat>
                                <v-toolbar-title>
                                    <v-autocomplete
                                        v-model="issue"
                                        :items="issues"
                                        item-title="key"
                                        item-value="key"
                                        label="Attach to Issue"
                                        class="mt-5 align-center"
                                        density="comfortable"
                                        variant="underlined"
                                    ></v-autocomplete>
                                </v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="primary"
                                    :disabled="!readyToCopy || null === issue"
                                    @click="attachToIssue"
                                ><v-icon small>fas fa-plus</v-icon></v-btn>
                            </v-toolbar>
                        </template>
                        <template #item.id="{item}">
                            {{ projectName(item.id) }}
                        </template>
                        <template #item.action="{item}">
                            <v-btn variant="plain" icon="fab fa-jenkins" size="small" :disabled="!item.source || !hasCiBuild(item.id)" @click="openJenkinsParamPage(item.id, item.source)"></v-btn>
                            <v-btn variant="plain" icon="fas fa-copy" size="small" @click="copyMergeRequest(item.id, item.number, item.source)">
                            </v-btn>
                            <v-btn variant="plain" icon="fas fa-external-link-alt" size="small" @click="openMergeRequest(item.id, item.number)">
                            </v-btn>
                            <v-btn variant="plain" icon="fas fa-trash" color="tertiary" size="small" @click="removeFromIssue(item.id, item.number)">
                            </v-btn>
                        </template>
                    </v-data-table>
                    <v-alert v-else color="warning" text="No issue found" icon="$warning" />
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-text v-else>
            <project-settings :project="autoProject" @close="closeDetect" />
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
