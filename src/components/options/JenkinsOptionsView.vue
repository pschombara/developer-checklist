<script setup>

import {computed, ref} from 'vue'
import {useJenkinsStorage} from '../../stores/jenkins.ts'
import JenkinsGeneral from './Jenkins/JenkinsGeneral.vue'
import JenkinsCategories from './Jenkins/JenkinsCategories.vue'
import JenkinsBuilds from './Jenkins/JenkinsBuilds.vue'
import Debounce from '../../utils/debounce.ts'

const jenkinsStorage = useJenkinsStorage()
const i18n = browser.i18n
const tab = ref(null)
const loaded = computed(() => {
    return jenkinsStorage.isLoaded
})

const text = {
    general: i18n.getMessage('General'),
    categories: i18n.getMessage('Categories'),
    builds: i18n.getMessage('Builds'),
}

const debounce = new Debounce()

jenkinsStorage.$subscribe(() => {
    if (loaded.value) {
        debounce.debounce(jenkinsStorage.save)
    }
})

jenkinsStorage.load()
</script>

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
                    <JenkinsGeneral />
                </v-window-item>
                <v-window-item>
                  <JenkinsBuilds />
                </v-window-item>
                <v-window-item>
                    <JenkinsCategories />
                </v-window-item>
            </v-window>
        </div>
    </v-card>
</template>
