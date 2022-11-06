<template>
    <v-card flat>
        <v-card-title>
            {{ issueName }}
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
                <template v-slot:activator="{on, attr}">
                    <v-btn
                        v-bind="attr"
                        v-on="on"
                        color="red lighten-3"
                        text
                        @click="stopWork(issueName)"
                        v-if="issue.work"
                    ><v-icon small left>fas fa-stop</v-icon> Stop Work</v-btn>
                    <v-btn
                        v-bind="attr"
                        v-on="on"
                        color="green lighten-3"
                        text
                        @click="startWork(issueName)"
                        v-else
                    ><v-icon small left>fas fa-play</v-icon> Start Work</v-btn>
                </template>
                <span>Issue will be preselected for CI-Builds and Merge Requests</span>
            </v-tooltip>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
                <template v-slot:activator="{on, attr}">
                    <v-btn
                        v-bind="attr"
                        v-on="on"
                        icon
                        v-bind:color="issue.pinned ? 'success' : 'grey'"
                        @click="issue.pinned ? unpin(issueName) : pin(issueName)"
                    >
                        <v-icon v-bind:class="issue.pinned ? '' : 'rotate--45-inverted'" small>fas fa-thumbtack</v-icon>
                    </v-btn>
                </template>
                <span>When active, issue is pinned, so it is sorted to the front in the quick select and is not automatically cleaned up.</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{on, attr}">
                    <v-btn
                        v-bind="attr"
                        v-on="on"
                        icon
                        @click="openOptions('jira')"
                    >
                        <v-icon small>fas fa-cog</v-icon>
                    </v-btn>
                </template>
                <span>Settings</span>
            </v-tooltip>
        </v-card-title>
        <v-card-text>
            <v-tabs
                vertical
                show-arrows
            >
                <v-tab
                    v-model="tab"
                    v-for="checklist in checklists"
                    :key="checklist.uuid"
                    :value="checklist.uuid"
                >
                    <v-tooltip right>
                        <template v-slot:activator="{on, attr}">
                            <v-icon
                                v-bind="attr"
                                v-on="on"
                            >fas fa-{{ checklist.icon }}
                            </v-icon>
                        </template>
                        <span>{{ checklist.name }}</span>
                    </v-tooltip>
                </v-tab>
                <v-tab v-model="tab" value="templates">
                    <v-tooltip right>
                        <template v-slot:activator="{on, attr}">
                            <v-icon v-bind="attr" v-on="on">fas fa-clipboard</v-icon>
                        </template>
                        <span>Templates</span>
                    </v-tooltip>
                </v-tab>
            </v-tabs>

            <v-window>
                <v-window-item v-for="checklist in checklists" :key="checklist.uuid" :value="checklist.uuid">
                    <checklist :uuid="checklist.uuid" :issue="issueName"></checklist>
                </v-window-item>
                <v-window-item value="templates">
                    <templates></templates>
                </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<script>
import Checklist from '@/components/popup/Jira/Checklist'
import Templates from '@/components/popup/Jira/Templates'

export default {
    name: 'PopupJira',
    components: {Templates, Checklist},
    created() {
        this.checklists = this.$store.getters['jira/getChecklists'].filter(checklist => checklist.enabled)
        this.issueName = this.$store.getters['currentIssue']
    },
    computed: {
        issue: function () {
            return this.$store.getters['issues/issue'](this.issueName)
        },
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
    data: () => {
        return {
            tab: null,
            checklists: [],
            checked: [],
            issueName: '',
        }
    },
}
</script>

<style>
    .rotate--45-inverted {
        transform: rotate(-45deg);
    }
</style>
