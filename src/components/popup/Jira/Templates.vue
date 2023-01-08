<template>
    <v-card flat>
        <v-card-text>
            <v-autocomplete
                :items="templates"
                item-title="title"
                return-object
                v-model="template"
                :label="text.templates"
                dense
            >
            </v-autocomplete>
            <v-textarea
                readonly
                :value="template.content"
                :label="text.preview"
                height="200"
                no-resize
                v-if="template"
                class="mt-0"
            ></v-textarea>
        </v-card-text>
        <v-card-actions v-if="template">
            <v-spacer></v-spacer>
            <v-btn @click="addComment" outlined color="success">{{ text.comment }}</v-btn>
            <v-btn @click="copyComment" outlined color="secondary"><v-icon>fas fa-copy</v-icon></v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>

        <copied-to-clipboard ref="message"></copied-to-clipboard>
    </v-card>
</template>

<script>
import CopiedToClipboard from '@/components/popup/mixed/CopiedToClipboard.vue'

export default {
    name: 'JiraTemplates',
    components: {CopiedToClipboard},
    computed: {
        templates: function () {
            return this.$store.getters['jira/templates']
        },
    },
    created() {
        if (this.templates.length > 0) {
            this.template = this.templates[0]
        }
    },
    methods: {
        addComment: function () {
            this.$store.dispatch('jira/addComment', {
                uuid: this.template.id,
                autoComment: false,
            })
        },
        copyComment: function () {
            let comment = this.$store.getters['jira/getTemplate'](this.template.id).content

            this.$store.dispatch('jira/commentReplacePlaceholders', comment)
                .then(result => {
                    console.log(result)
                    let blob = new Blob([result], {type: 'text/html'})

                    navigator.clipboard.write(
                        [
                            new ClipboardItem({[blob.type]: blob}),
                        ],
                    ).then(() => {
                        this.$refs.message.show()
                    })
                })
        },
    },
    data() {
        return {
            text: {
                templates: chrome.i18n.getMessage('Templates'),
                preview: chrome.i18n.getMessage('Preview'),
                comment: chrome.i18n.getMessage('Comment'),
                copy: chrome.i18n.getMessage('Copy'),
            },
            template: null,
        }
    },
}
</script>
