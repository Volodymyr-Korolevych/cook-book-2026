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
                primary: '#f5a623', // м’який теплий акцент
            }
        }
    },
    plugins: []
}
