import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
  
  theme: {
    extend: {
      width: {
        '3/7': 'calc(3 / 7 * 100%)',
        '4/7': 'calc(4 / 7 * 100%)',
      },
      colors: {
        // Standard Tailwind grays with dark theme
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },

        main: "rgb(var(--main) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface_secondary: "rgb(var(--surface_secondary) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        tertiary: "rgb(var(--tertiary) / <alpha-value>)",
        blur_button: "rgb(var(--blur_button) / <alpha-value>)",
        red_main: "rgb(var(--red_main) / <alpha-value>)",
        blue_main: "rgb(var(--blue_main) / <alpha-value>)",
        

        text_header: "rgb(var(--text_header) / <alpha-value>)",
        text_header_secondary: "rgb(var(--text_header_secondary) / <alpha-value>)",
        text_option_header: "rgb(var(--text_option_header) / <alpha-value>)",
        text_option_child: "rgb(var(--text_option_child) / <alpha-value>)",
        text_diff_lvl_1: "rgb(var(--text_diff_lvl_1) / <alpha-value>)",
        text_diff_lvl_2: "rgb(var(--text_diff_lvl_2) / <alpha-value>)",
        text_diff_lvl_3: "rgb(var(--text_diff_lvl_3) / <alpha-value>)",
        text_gp_score: "rgb(var(--text_gp_score) / <alpha-value>)",
      },
    },  
  },
};


export default config;
