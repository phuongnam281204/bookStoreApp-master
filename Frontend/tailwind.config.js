/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                paper: token("paper"),
                surface: token("surface"),
                ink: token("ink"),
                muted: token("muted"),
                line: token("line"),
                accent: token("accent"),
                "accent-ink": token("accent-ink"),
                sale: token("sale"),
            },
            fontFamily: {
                display: ['"Newsreader"', "Georgia", "serif"],
                sans: ['"Hanken Grotesk"', "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [require("daisyui")],
    // daisyUI components (modals, inputs, menus) follow the same paper palette.
    daisyui: {
        themes: [
            {
                light: {
                    primary: "#7a4a2c",
                    "primary-content": "#ffffff",
                    secondary: "#2a2622",
                    accent: "#7a4a2c",
                    neutral: "#2a2622",
                    "base-100": "#f7f3ec",
                    "base-200": "#ede6da",
                    "base-300": "#ddd4c6",
                    "base-content": "#2a2622",
                    "--rounded-box": "0.5rem",
                    "--rounded-btn": "0.375rem",
                },
            },
            {
                dark: {
                    primary: "#c9916a",
                    "primary-content": "#1c1916",
                    secondary: "#f0eae1",
                    accent: "#c9916a",
                    neutral: "#f0eae1",
                    "base-100": "#1c1916",
                    "base-200": "#27231f",
                    "base-300": "#3a352f",
                    "base-content": "#f0eae1",
                    "--rounded-box": "0.5rem",
                    "--rounded-btn": "0.375rem",
                },
            },
        ],
    },
};
