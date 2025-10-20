<script lang="ts" setup>

import {useJiraStorage} from '@/stores/jira.js'
import {computed, ref} from 'vue'
import {usePopupStorage} from '@/stores/popup.js'
import {useIssueStorage} from '@/stores/issues.js'
import {useMainStorage} from '@/stores/mainStorage.js'
import JiraChecklist from './Jira/JiraChecklist.vue'
import PopupTemplates from './Jira/PopupTemplates.vue'

const jiraStorage = useJiraStorage()
const popupStorage = usePopupStorage()
const issueStorage = useIssueStorage()

const i18n = browser.i18n
const text = {
    openWithIssue: browser.i18n.getMessage('openWithIssue'),
    startWork: browser.i18n.getMessage('startWork'),
    stopWork: browser.i18n.getMessage('stopWork'),
    helpWork: browser.i18n.getMessage('helpWork'),
    helpPin: browser.i18n.getMessage('helpPin'),
}

const checklists = computed(() => jiraStorage.getChecklists.filter(checklist => checklist.enabled))

const tab = ref(0)
const issueName = computed(() => popupStorage.getCurrentIssue)
const issue = computed(() => {
    const issueKey = popupStorage.getCurrentIssue

    if (null === issueKey) {
        return null
    }

    console.log(issueStorage.getIssue(issueKey))

    return issueStorage.getIssue(issueKey)
})

const pin = issue => issueStorage.pin(issue)
const unpin = issue => issueStorage.unpin(issue)
const startWork = issue => issueStorage.startWork(issue)
const stopWork = issue => issueStorage.stopWork(issue)

const openOptions = tab => {
    useMainStorage().changeMainTab(tab)
    browser.runtime.openOptionsPage()
}

const load = async () => {
    await issueStorage.load()
}

load()
</script>

<template>
    <v-card v-if="issue">
        <v-card-title>
            <v-row>
                <v-col cols="5">{{ issueName }}</v-col>
                <v-col cols="4">
                    <v-tooltip location="bottom">
                        <template #activator="{props}">
                            <v-btn
                                v-if="issue && issue.work"
                                v-bind="props"
                                color="primary lighten-2"
                                variant="text"
                                @click="stopWork(issueName)"
                            >
                                <v-icon small left>fas fa-stop</v-icon>&nbsp;{{ text.stopWork }}
                            </v-btn>
                            <v-btn
                                v-else
                                v-bind="props"
                                color="grey darken-2"
                                variant="text"
                                @click="startWork(issueName)"
                            >
                                <v-icon small left>fas fa-play</v-icon>&nbsp; {{ text.startWork }}
                            </v-btn>
                        </template>
                        <span>{{ text.helpWork }}</span>
                    </v-tooltip>
                </v-col>
                <v-col cols="3">
                    <v-tooltip location="bottom">
                        <template #activator="{props}">
                            <v-btn
                                v-if="issueName"
                                v-bind="props"
                                variant="text"
                                :color="issue.pinned ? 'primary' : 'secondary'"
                                @click="issue.pinned ? unpin(issueName) : pin(issueName)"
                            >
                                <v-icon :class="issue.pinned ? '' : 'rotate--45-inverted'" small>fas fa-thumbtack
                                </v-icon>
                            </v-btn>
                        </template>
                        <span>{{ text.helpPin }}</span>
                    </v-tooltip>
                    <v-tooltip location="bottom">
                        <template #activator="{props}">
                            <v-btn
                                v-bind="props"
                                variant="text"
                                @click="openOptions('jira')"
                            >
                                <v-icon small>fas fa-cog</v-icon>
                            </v-btn>
                        </template>
                        <span>Settings</span>
                    </v-tooltip>
                </v-col>
            </v-row>
        </v-card-title>
        <v-card-text>
            <div class="d-flex flex-row">
                <v-tabs
                    v-model="tab"
                    direction="vertical"
                    show-arrows
                >
                    <v-tab
                        v-for="checklist in checklists"
                        :key="checklist.uuid"
                        :value="checklist.uuid"
                        :disabled="!issueName"
                    >
                        <v-tooltip location="right">
                            <template #activator="{props}">
                                <v-icon v-bind="props" center>fas fa-{{ checklist.icon }}</v-icon>
                            </template>
                            <span>{{ checklist.name }}</span>
                        </v-tooltip>
                    </v-tab>

                    <v-tab v-model="tab" value="templates">
                        <v-tooltip location="right">
                            <template #activator="{props}">
                                <v-icon v-bind="props">fas fa-clipboard</v-icon>
                            </template>
                            <span>Templates</span>
                        </v-tooltip>
                    </v-tab>
                </v-tabs>

                <v-window v-model="tab" class="flex-grow-1">
                    <v-window-item v-for="checklist in checklists" :key="checklist.uuid" :value="checklist.uuid">
                        <JiraChecklist :uuid="checklist.uuid" :issue="issueName" />
                    </v-window-item>
                    <v-window-item value="templates">
                        <PopupTemplates/>
                    </v-window-item>
                </v-window>
            </div>
        </v-card-text>
    </v-card>
    <v-card v-else>
        <v-card-title>
            <v-row>
                <v-col cols="10">{{ text.openWithIssue }}</v-col>
                <v-col cols="2">
                    <v-tooltip location="bottom">
                        <template #activator="{props}">
                            <v-btn
                                v-bind="props"
                                variant="text"
                                @click="openOptions('jira')"
                            >
                                <v-icon small>fas fa-cog</v-icon>
                            </v-btn>
                        </template>
                        <span>Settings</span>
                    </v-tooltip>
                </v-col>
            </v-row>
        </v-card-title>
        <v-card-item>
            <PopupTemplates />
        </v-card-item>
    </v-card>
</template>

<style>
.rotate--45-inverted {
    transform: rotate(-45deg);
}
</style>
