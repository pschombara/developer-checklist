<template>
    <v-card v-if="issueName">
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
                                <v-icon small left>fas fa-stop</v-icon>&nbsp;Stop Work
                            </v-btn>
                            <v-btn
                                v-else
                                v-bind="props"
                                color="grey darken-2"
                                variant="text"
                                @click="startWork(issueName)"
                            >
                                <v-icon small left>fas fa-play</v-icon>&nbsp; Start Work
                            </v-btn>
                        </template>
                        <span>Issue will be preselected for CI-Builds and Merge Requests</span>
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
                        <span>When active, issue is pinned, so it is sorted to the front in the quick select and is not automatically cleaned up.</span>
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
                    <v-tab v-model="tab" value="issueList" :disabled="!!issueName">
                        <v-tooltip location="right">
                            <template #activator="{props}">
                                <v-icon v-bind="props">fas fa-list</v-icon>
                            </template>
                            <span>Issues</span>
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
                    <span v-if="issueName">
                        <v-window-item v-for="checklist in checklists" :key="checklist.uuid" :value="checklist.uuid">
                            <checklist :uuid="checklist.uuid" :issue="issueName"></checklist>
                        </v-window-item>
                    </span>
                    <span v-else>
                        <v-window-item value="issueList">
                            <issues></issues>
                        </v-window-item>
                    </span>
                    <v-window-item value="templates">
                        <templates></templates>
                    </v-window-item>
                </v-window>
            </div>
        </v-card-text>
    </v-card>
    <v-card v-else>
        <templates></templates>
    </v-card>
</template>

<script>
import Checklist from './Jira/Checklist.vue'
import Templates from './Jira/Templates.vue'

export default {
    name: 'PopupJira',
    components: {Templates, Checklist},
    data: () => {
        return {
            tab: 0,
            checklists: [],
            checked: [],
            issueName: null,
        }
    },
    computed: {
        issue: function () {
            if (!this.issueName) {
                return null
            }

            return this.$store.getters['issues/issue'](this.issueName)
        },
    },
    created() {
        this.checklists = this.$store.getters['jira/getChecklists'].filter(checklist => checklist.enabled)
        this.issueName = this.$store.getters['currentIssue']
    },
    methods: {
        pin: function (issue) {
            this.$store.dispatch('issues/pin', issue)
        },
        unpin: function (issue) {
            this.$store.dispatch('issues/unpin', issue)
        },
        openOptions: function (tab) {
            this.$store.dispatch('changeMainTab', tab)
            chrome.runtime.openOptionsPage()
        },
        startWork: function (issue) {
            this.$store.dispatch('issues/startWork', issue)
        },
        stopWork: function (issue) {
            this.$store.dispatch('issues/stopWork', issue)
        },
    },
}
</script>

<style>
.rotate--45-inverted {
    transform: rotate(-45deg);
}
</style>
