const themeBlueLight = {
    dark: false,
    colors: {
        primary: '#00639a',
        secondary: '#51606f',
        tertiary: '#68587a',
        error: '#ba1a1a',
        surface: '#fcfcff',
    },
}

const themeBlueDark = {
    dark: true,
    colors: {
        primary: '#96ccff',
        secondary: '#b9c8da',
        tertiary: '#d3bfe6',
        error: '#ffb4ab',
        surface: '#1a1c1e',
    },
}

const themes = {
    blue: {
        light: themeBlueLight,
        dark: themeBlueDark,
    },
}

export default {
    themes,
}
