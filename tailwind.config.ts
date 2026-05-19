import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0A0D14',           // Charcoal Obsidian (App Background)
          surface: '#121620',      // Elevated Midnight Carbon (Cards/Panels)
          primary: '#0E6C56',      // Viridian Spruce (Primary Actions)
          'primary-hover': '#128268', // Spruce Luster (Primary Active Hover)
          accent: '#DF7356',       // Terracotta Sienna (Accent Highlights)
          text: '#ECF0F6',         // Crisp Alabaster (Primary Text)
          muted: '#7E8A9E',        // Mist Blue-Gray (Secondary/Muted Text)
          border: '#1F2635',       // Steel Dusk Separator (Subtle Separators)
        },
      },
    },
  },
  plugins: [],
};

export default config;
