<script lang="ts" setup>

import Theme from '../../utils/theme'
import QuickList from '../../components/popup/QuickList.vue'
import {computed, ref} from 'vue'
import {useMainStorage} from '../../stores/mainStorage'
import {usePopupStorage} from '../../stores/popup'
import JiraPopup from '../../components/popup/JiraPopup.vue'
import JenkinsPopup from '../../components/popup/JenkinsPopup.vue'
import GitlabPopup from '../../components/popup/GitlabPopup.vue'
import ChatPopup from '../../components/popup/ChatPopup.vue'
import CheatSheetPopup from '../../components/popup/CheatSheetPopup.vue'

const i18n = browser.i18n
const loading = ref(true)
const title = i18n.getMessage('extName')

const mainStorage = useMainStorage()
const popupStorage = usePopupStorage()

const tabs = [
    { id: 'bookmark', name: 'Quick Select', icon: 'fas fa-bookmark' },
    { id: 'jira', name: 'Jira', icon: 'fab fa-jira' },
    { id: 'jenkins', name: 'Jenkins', icon: 'fab fa-jenkins' },
    { id: 'gitLab', name: 'GitLab', icon: 'fab fa-gitlab' },
    { id: 'chat', name: 'Chat', icon: 'fas fa-comment' },
    { id: 'cheatSheet', name: 'Cheat Sheet', icon: 'fas fa-terminal' },
]

const tab = ref(null)
const optionsValid = computed(() => {
    return popupStorage.hasValidOptions
})

const modules = computed(() => {
    return mainStorage.getModules
})

const openOptions = async tab => {
    await browser.storage.local.set({'optionsTab': tab})
    browser.runtime.openOptionsPage()
}

const showTab = tab => {
    return modules.value[tab.id] ?? true
}

const checkSwitchTab = () => {
    if (null === popupStorage.getSwitchTab) {
        return
    }

    tab.value = popupStorage.getSwitchTab
}

const theme = new Theme()
theme.registerThemeChanged(mainStorage.getThemeSchema, mainStorage.getThemeColor)

const load = async () => {
    await mainStorage.load()
    await checkTabIsLoaded(await popupStorage.fetchCurrentTab())
}

const checkTabIsLoaded = async tab => {
    if ('complete' !== tab.status) {
        setTimeout(async () => checkTabIsLoaded(await popupStorage.fetchCurrentTab()), 500)
        return
    }

    await popupStorage.checkOptions()
    await popupStorage.checkUrl()
    await checkSwitchTab()
    loading.value = false
}
load()
</script>

<template>
    <v-app>
        <v-container fluid>
            <div v-if="loading" class="text-center">
                <v-progress-circular size="256" width="10" color="primary" indeterminate=""></v-progress-circular>
            </div>
            <div v-else>
                <v-row>
                    <v-col>
                        <v-img src="icon-48.png" width="20" aspect-ratio="1/1" class="d-inline-block me-1"></v-img>
                        <h2 class="d-inline-block">{{ title }}</h2>
                    </v-col>
                </v-row>
                <v-row v-if="modules && optionsValid">
                    <v-col>
                        <v-card>
                            <v-tabs
                                v-model="tab"
                                show-arrows
                            >
                                <v-tooltip
                                    v-for="item in tabs"
                                    :key="item.id"
                                    bottom>
                                    <template #activator="{props}">
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
                                    <QuickList />
                                </v-window-item>
                                <v-window-item value="jira">
                                    <JiraPopup />
                                </v-window-item>
                                <v-window-item value="jenkins">
                                    <JenkinsPopup />
                                </v-window-item>
                                <v-window-item value="gitLab">
                                    <GitlabPopup />
                                </v-window-item>
                                <v-window-item value="chat">
                                    <ChatPopup />
                                </v-window-item>
                                <v-window-item value="cheatSheet">
                                    <CheatSheetPopup />
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
            </div>
        </v-container>
    </v-app>
</template>

<style>
html {
  min-width: 720px;
  max-width: 720px;
}
</style>
