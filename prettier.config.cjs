/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  semi: false,
  useTabs: false,
  tabWidth: 2,
};

module.exports = config;
