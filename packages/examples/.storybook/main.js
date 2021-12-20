module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    // "@storybook/addon-links",
    // "@storybook/addon-essentials",
    {
      name: '@storybook/addon-storysource',
    },
    "@storybook/preset-create-react-app",
  ],
  webpackFinal: config => {
    const CircularDependencyPlugin = require('circular-dependency-plugin')
    config.plugins.push(new CircularDependencyPlugin({}))
    return config
  }
}