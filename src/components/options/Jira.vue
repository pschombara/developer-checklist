<template>
    <v-card fluid class="mt-5">
        <div class="d-flex flex-row">
            <v-tabs
                v-model="tab"
                direction="vertical"
            >
                <v-tab class="mt-5" value="general">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon>fas fa-sliders-h</v-icon>
                        </v-col>
                        <v-col class="text-center">
                            {{ text.general }}
                        </v-col>
                    </v-row>
                </v-tab>
                <v-tab class="mt-5" value="checklists">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon>fas fa-tasks</v-icon>
                        </v-col>
                        <v-col class="text-center">
                            {{ text.checklists }}
                        </v-col>
                    </v-row>
                </v-tab>
                <v-tab class="mt-5" value="templates">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon>fas fa-clipboard</v-icon>
                        </v-col>
                        <v-col class="text-center">
                            {{ text.templates }}
                        </v-col>
                    </v-row>
                </v-tab>
                <v-tab class="mt-5" value="issues">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon>fas fa-history</v-icon>
                        </v-col>
                        <v-col class="text-center">
                            {{ text.issues }}
                        </v-col>
                    </v-row>
                </v-tab>

            </v-tabs>

            <v-window class="flex-fill" v-model="tab">
                <v-window-item value="general">
                    <general></general>
                </v-window-item>
                <v-window-item value="checklists">
                    <checklists></checklists>
                </v-window-item>
                <v-window-item value="templates">
                    <templates></templates>
                </v-window-item>
                <v-window-item issues>
                    <issues></issues>
                </v-window-item>
            </v-window>
        </div>
    </v-card>
</template>

<script>
import General from '@/components/options/Jira/General'
import Checklists from '@/components/options/Jira/Checklists'
import Templates from '@/components/options/Jira/Templates'
import Issues from '@/components/options/Jira/Issues'

export default {
    name: 'OptionJira',
    components: {Issues, General, Checklists, Templates},
    data: function() {
        return {
            text: {
                general: chrome.i18n.getMessage('General'),
                checklists: chrome.i18n.getMessage('Checklists'),
                templates: chrome.i18n.getMessage('Templates'),
                issues: 'Issues',
            },
            tab: null,
        }
    },
}
</script>
