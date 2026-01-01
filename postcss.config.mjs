// postcss.config.mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // ⬅️ et surtout PAS "tailwindcss"
  },
};

export default config;
