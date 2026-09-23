import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        condensed: ['var(--font-condensed)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
