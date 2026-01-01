import type { Config } from 'tailwindcss'

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(36, 100%, 65%)', // Orange magique
        'primary-dark': 'hsl(36, 100%, 55%)',
        'primary-light': 'hsl(36, 100%, 85%)',
        gradient: 'hsl(359, 100%, 50%)',
        success: 'hsl(142, 76%, 36%)',
        danger: 'hsl(0, 84%, 60%)',
        warning: 'hsl(45, 92%, 60%)',
        info: 'hsl(221, 83%, 53%)',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
}

export default config
