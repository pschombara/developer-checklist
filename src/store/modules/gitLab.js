// const state = {
//     categories: [],
//     projects: [],
//     host: '',
//     currentProject: '',
//     currentNumber: null,
//     currentSource: null,
// }
//
// export default {
//     mutations: {
//         SET_CURRENT_PROJECT: (state, project) => {
//             state.currentProject = project
//         },
//         SET_CURRENT_NUMBER: (state, number) => {
//             state.currentNumber = number
//         },
//         SET_CURRENT_SOURCE: (state, source) => {
//             state.currentSource = source
//         },
//     },
//     actions: {
//         // popup
//         checkUrl: ({state, commit, rootGetters}) => {
//             return new Promise(resolve => {
//                 const url = rootGetters['currentUrl']
//
//                 if ('' === state.host || false === url.startsWith(state.host)) {
//                     resolve()
//
//                     return
//                 }
//
//                 const project = state.projects.find(e => {
//                     return url.includes(`/${e.domain}/${e.project}/`)
//                 })
//
//                 if (undefined === project) {
//                     resolve()
//
//                     return
//                 }
//
//                 const matches = url.match('/merge_requests/(?<number>\\d+)')
//
//                 commit('SET_CURRENT_PROJECT', project.uuid)
//                 commit('SET_CURRENT_NUMBER', parseInt(matches.groups.number))
//
//                 const currentTab = rootGetters['currentTab']
//
//                 currentTab.then(tab => {
//                     chrome.scripting.executeScript(
//                         {
//                             target: {tabId: tab.id},
//                             func: () => {
//                                 const ref = document.querySelector('.js-source-branch-copy')
//
//                                 if (null !== ref) {
//                                     return ref.dataset.clipboardText
//                                 }
//
//                                 return null
//                             },
//                         },
//                         injectionResult => {
//                             if (injectionResult.length > 0) {
//                                 commit('SET_CURRENT_SOURCE', injectionResult[0].result)
//                             }
//
//                             resolve()
//                         },
//                     )
//                 })
//
//                 resolve()
//             })
//         },
//     },
//     getters: {
//         getProject: state => id => {
//             for (let project of state.projects) {
//                 if (id === project.uuid) {
//                     return project
//                 }
//             }
//
//             return null
//         },
//         currentProject: state => state.currentProject,
//         currentNumber: state => state.currentNumber,
//         currentSource: state => state.currentSource,
//         getCiBuild: (state, getters) => id => {
//             const project = getters['getProject'](id)
//
//             if (null === project || null === project.ciBuild) {
//                 return null
//             }
//
//             return project.ciBuild
//         },
//         url: state => (id, number, source, withAlias) => {
//             const project = state.projects.find(e => e.uuid === id)
//
//             if (undefined === project) {
//                 return ''
//             }
//
//             let aliasUrl = project.project + ('' !== source ? `:${source}` : '')
//
//             if (withAlias) {
//                 return `<a href="${state.host}${project.domain}/${project.project}/merge_requests/${number}">${aliasUrl}</a>`
//             }
//
//             return `${state.host}${project.domain}/${project.project}/merge_requests/${number}`
//         },
//     },
// }
