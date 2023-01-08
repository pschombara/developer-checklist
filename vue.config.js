module.exports = {
    pages: {
        popup: {
            template: 'public/index.html',
            entry: './src/popup/main.js',
            title: 'Popup',
        },
        options: {
            template: 'public/index.html',
            entry: './src/options/main.js',
            title: 'Options',
        },
    },

    transpileDependencies: [
        'vuetify',
    ],
    configureWebpack: {
        devtool: 'cheap-module-source-map',
    },
}
