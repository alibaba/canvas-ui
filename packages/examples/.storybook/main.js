import { dirname, join } from "path";
module.exports = {
  "stories": ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  "addons": [// "@storybook/addon-links",
  // "@storybook/addon-essentials",
  {
    name: '@storybook/addon-storysource',
  }, getAbsolutePath("@storybook/preset-create-react-app"), getAbsolutePath("@storybook/addon-webpack5-compiler-babel")],

  webpackFinal: config => {
    const CircularDependencyPlugin = require('circular-dependency-plugin')
    config.plugins.push(new CircularDependencyPlugin({}))
    return config
  },

  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {}
  },

  docs: {
    autodocs: true
  }
}

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}