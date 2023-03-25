<template>
    <v-card fluid class="mt-5">
        <div class="d-flex flex-row">
            <v-tabs v-model="tab" direction="vertical">
                <v-tab class="mt-5">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon icon="fas fa-sliders-h"/>
                        </v-col>
                        <v-col class="text-center">
                            {{ text.general }}
                        </v-col>
                    </v-row>
                </v-tab>
                <v-tab class="mt-5">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon icon="fas fa-cubes"/>
                        </v-col>
                        <v-col class="text-center">
                            {{ text.builds }}
                        </v-col>
                    </v-row>
                </v-tab>
                <v-tab class="mt-5">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon icon="fas fa-sitemap"/>
                        </v-col>
                        <v-col class="text-center">
                            {{ text.categories }}
                        </v-col>
                    </v-row>
                </v-tab>
            </v-tabs>

            <v-window v-model="tab" class="flex-fill">
                <v-window-item>
                    <general></general>
                </v-window-item>
                <v-window-item>
                    <builds></builds>
                </v-window-item>
                <v-window-item>
                    <categories></categories>
                </v-window-item>
            </v-window>
        </div>
    </v-card>
</template>

<script>

import Builds from './Jenkins/Builds.vue'
import Categories from './Jenkins/Categories.vue'
import General from './Jenkins/General.vue'

export default {
    name: 'OptionJenkins',
    components: {Builds, Categories, General},
    data() {
        return {
            i18n: chrome.i18n,
            text: {
                general: chrome.i18n.getMessage('General'),
                categories: chrome.i18n.getMessage('Categories'),
                builds: chrome.i18n.getMessage('Builds'),
            },
            tab: null,
        }
    },
}
</script>
