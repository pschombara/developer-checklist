const state = {
    tabGroups: {
        grey: {
            title: '',
            active: false,
            urls: [],
        },
        blue: {
            title: '',
            active: false,
            urls: [],
        },
        red: {
            title: '',
            active: false,
            urls: [],
        },
        yellow: {
            title: '',
            active: false,
            urls: [],
        },
        green: {
            title: '',
            active: false,
            urls: [],
        },
        pink: {
            title: '',
            active: false,
            urls: [],
        },
        purple: {
            title: '',
            active: false,
            urls: [],
        },
        cyan: {
            title: '',
            active: false,
            urls: [],
        },
    },
}

export default {
    strict: process.env.NODE_ENV !== 'production',
    namespaced: true,
    modules: {},
    actions: {
        save: ({state}) => {
            return new Promise(resolve => {
                resolve(
                    {
                        key: 'chrome',
                        options: {
                            tabGroups: state.tabGroups,
                        },
                    },
                )
            })
        },
    },
    getters: {
        getTabGroups: state => {
            return state.tabGroups
        },
    },
    state,
}
