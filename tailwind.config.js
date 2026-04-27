// tailwind.config.js
module.exports = {
    content: [
        './components/**/*.{vue,js,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue'
    ],
    theme: {
        extend: {
            colors: {
                primary: '#6f7f3f',
                primaryHover: '#5f6e35',
                surface: '#fbfaf6'
            }
        }
    },
    plugins: []
}
