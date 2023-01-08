<template>
    <v-app>
        <v-container fluid>
            <v-overlay opacity=".75" v-if="loading">
                <v-progress-circular size="256" width="10" color="orange" indeterminate></v-progress-circular>
            </v-overlay>
            <v-toolbar flat>
                <v-row>
                    <v-col cols="1" class="align-center">
                        <v-img src="icons/48.png" max-height="24" max-width="24" class="mr-2"></v-img>
                    </v-col>
                    <v-col cols="11">
                        <v-toolbar-title>{{ title }}</v-toolbar-title>
                    </v-col>
                </v-row>
            </v-toolbar>
            <v-row v-if="modules && optionsValid">
                <v-col>
                    <v-card>
                        <v-tabs
                            show-arrows
                            v-model="tab"
                        >
                            <v-tooltip
                                v-for="item in tabs"
                                :key="item.id"
                                bottom>
                                <template v-slot:activator="{props}">
                                    <v-tab
                                        v-show="showTab(item)"
                                        v-bind="props"
                                        :value="item.id"
                                    >
                                        <v-icon>{{ item.icon }}</v-icon>
                                    </v-tab>
                                </template>
                                {{ item.name }}
                            </v-tooltip>
                        </v-tabs>

                        <v-window v-model="tab">
                            <v-window-item value="bookmark">
                                <quick-list></quick-list>
                            </v-window-item>
                            <v-window-item value="jira">
                                <Jira></Jira>
                            </v-window-item>
                            <v-window-item value="jenkins">
                                <Jenkins></Jenkins>
                            </v-window-item>
                            <v-window-item value="gitLab">
                                <GitLab></GitLab>
                            </v-window-item>
                            <v-window-item value="chat">
                                <Chat></Chat>
                            </v-window-item>
                            <v-window-item value="cheatSheet">
                                <CheatSheet></CheatSheet>
                            </v-window-item>
                        </v-window>
                    </v-card>
                </v-col>
            </v-row>
            <v-row v-else>
                <v-col>
                    <v-card>
                        <v-card-text>
                            {{i18n.getMessage('missingJiraUrl')}}
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" plain @click="openOptions('jira')">{{i18n.getMessage('openOptions')}}</v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </v-app>
</template>

<script>

import Theme from '@/mixins/theme'
import QuickList from '../components/popup/QuickList'
import Jira from '../components/popup/Jira'
import Jenkins from '../components/popup/Jenkins'
import GitLab from '../components/popup/GitLab'
import Chat from '../components/popup/Chat'
import CheatSheet from '../components/popup/CheatSheet'

export default {
    name: 'App',
    components: {CheatSheet, Chat, GitLab, Jenkins, Jira, QuickList },
    computed: {
        modules()  {
            return this.$store.getters['modules']
        },
    },
    methods: {
        load() {
            this.$store.dispatch('load').then(() => {
                this.validateOptions()
            })
        },
        validateOptions: function () {
            this.optionsValid = this.$store.getters['optionsValid']

            if (this.optionsValid) {
                this.checkUrl()
            } else {
                this.loading = false
            }
        },
        checkUrl: function () {
            this.$store.dispatch('checkUrl').then(() => {
                this.checkSwitchTab()

                this.loading = false
            })
        },
        checkSwitchTab: function () {
            this.tab = this.$store.getters['switchTab']
        },
        showTab: function (tab) {
            if ('jira' === tab.id) {
                return null !== this.$store.getters['currentIssue']
            }

            if (Object.prototype.hasOwnProperty.call(this.modules, tab.id)) {
                return this.modules[tab.id]
            } else {
                return true
            }
        },
        openOptions: function (tab) {
            chrome.storage.local.set({'optionsTab': tab}, () => {
                chrome.runtime.openOptionsPage()
            })
        },
    },
    created() {
        this.load()

        const theme = new Theme()
        theme.registerThemeChanged(this)
    },
    data() {
        return {
            loading: true,
            title: chrome.i18n.getMessage('extName'),
            tabs: [
                { id: 'bookmark', name: 'Quick Select', icon: 'fas fa-bookmark' },
                { id: 'jira', name: 'Jira', icon: 'fab fa-jira' },
                { id: 'jenkins', name: 'Jenkins', icon: 'fab fa-jenkins' },
                { id: 'gitLab', name: 'GitLab', icon: 'fab fa-gitlab' },
                { id: 'chat', name: 'Chat', icon: 'fas fa-comment' },
                { id: 'cheatSheet', name: 'Cheat Sheet', icon: 'fas fa-terminal' },
            ],
            tab: null,
            optionsValid: false,
            optionsUrl: '',
            i18n: chrome.i18n,
        }
    },
}
</script>

<style>
html {
  min-width: 600px;
}

.v-application > .v-application--wrap {
    min-height: unset;
}
</style>
