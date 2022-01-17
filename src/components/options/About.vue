<template>
    <v-card flat class="mt-5">
        <v-card-text>
            <v-row>
                <v-col cols="12" v-html="about"></v-col>
            </v-row>
            <v-row class="mt-3">
                <v-col cols="12">
                    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" class="col">
                        <input type="hidden" name="cmd" value="_s-xclick"/>
                        <input type="hidden" name="hosted_button_id" value="X5XGC2J7M2RZ6"/>
                        <input type="image" src="images/btn_donateCC_LG.gif"
                               name="submit" title="PayPal - The safer, easier way to pay online!"
                               alt="Donate with PayPal button"/>
                    </form>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'About',
    data() {
        return {
            about: chrome.i18n.getMessage('extAbout'),
        }
    },
}
</script>
