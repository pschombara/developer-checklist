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
                        <v-icon>fas fa-cubes</v-icon>
                    </v-col>
                    <v-col class="text-center">
                        {{ text.builds }}
                    </v-col>
                </v-row>
            </v-tab>
            <v-tab class="mt-5">
                <v-row align="center">
                    <v-col class="text-start">
                        <v-icon>fas fa-sitemap</v-icon>
                    </v-col>
                    <v-col class="text-center">
                        {{ text.categories }}
                    </v-col>
                </v-row>
            </v-tab>

            <v-tab-item>
                <general></general>
            </v-tab-item>
            <v-tab-item>
                <builds></builds>
            </v-tab-item>
            <v-tab-item>
                <categories></categories>
            </v-tab-item>
        </v-tabs>
    </v-card>
</template>

<script>

import Builds from './Jenkins/Builds'
import Categories from './Jenkins/Categories'
import General from './Jenkins/General'

export default {
    name: 'Jenkins',
    components: {Builds, Categories, General},
    data() {
        return {
            i18n: chrome.i18n,
            text: {
                general: chrome.i18n.getMessage('General'),
                categories: chrome.i18n.getMessage('Categories'),
                builds: chrome.i18n.getMessage('Builds'),
            },
        }
    },
}
</script>
