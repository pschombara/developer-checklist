<template>
    <v-card fluid class="mt-5">
        <v-tabs vertical>
            <v-tab class="mt-5">
                <v-row align="center">
                    <v-col class="text-start">
                        <v-icon>fas fa-sliders-h</v-icon>
                    </v-col>
                    <v-col class="text-center">
                        {{ text.general }}
                    </v-col>
                </v-row>
            </v-tab>
            <v-tab class="mt-5">
                <v-row align="center">
                    <v-col class="text-start">
                        <v-icon>fas fa-tasks</v-icon>
                    </v-col>
                    <v-col class="text-center">
                        {{ text.checklists }}
                    </v-col>
                </v-row>
            </v-tab>
            <v-tab class="mt-5">
                <v-row align="center">
                    <v-col class="text-start">
                        <v-icon>fas fa-clipboard</v-icon>
                    </v-col>
                    <v-col class="text-center">
                        {{ text.templates }}
                    </v-col>
                </v-row>
            </v-tab>
            <v-tab class="mt-5">
                <v-row align="center">
                    <v-col class="text-start">
                        <v-icon>fas fa-history</v-icon>
                    </v-col>
                    <v-col class="text-center">
                        {{ text.issues }}
                    </v-col>
                </v-row>
            </v-tab>

            <v-tab-item>
                <general></general>
            </v-tab-item>
            <v-tab-item>
                <checklists></checklists>
            </v-tab-item>
            <v-tab-item>
                <templates></templates>
            </v-tab-item>
            <v-tab-item>
                <issues></issues>
            </v-tab-item>
        </v-tabs>
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
        }
    },
}
</script>
