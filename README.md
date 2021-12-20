# Canvas UI

Canvas UI 是一个基于 HTML Canvas 的通用 UI 渲染器。

## 目录结构

- packages/core
渲染器的核心，提供了诸如 createElement，事件，渲染管线等能力。

- packages/react
Canvas UI 的官方 React 绑定，提供 `<View />` `<Text />` 等组件

- packages/examples
基于 Storybook 的组件开发和测试环境

- tools/
一些脚本

## 开始开发

```
# 启动 core 和 react 的开发模式
$ yarn dev

# 启动 Storybook
$ yarn dev:examples

# 运行单元测试
$ yarn test

# 构建 umd, esm 版本
$ yarn build

# 打版本
$ yarn lerna version

# 发布
$ sh ./tools/publish.sh
```