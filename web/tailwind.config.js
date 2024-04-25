const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const TailwindConfig = require('../libs/ui-kit/util/src/tailwind/tailwind.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...TailwindConfig,
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    ...TailwindConfig.theme,
    extend: {},
  },
  plugins: [...TailwindConfig.plugins, require('daisyui')],
};
