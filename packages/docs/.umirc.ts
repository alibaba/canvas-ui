import { defineConfig } from 'dumi'

export default defineConfig({
  title: 'Canvas UI',
  mode: 'doc',
  locales: [['zh-CN', '中文']],
  logo: process.env.NODE_ENV === 'production' ? '/canvas-ui/images/logomark.svg' : '/images/logomark.svg',
  base: process.env.NODE_ENV === 'production' ? '/canvas-ui/' : '/',
  publicPath: process.env.NODE_ENV === 'production' ? '/canvas-ui/' : '/',
  // more config: https://d.umijs.org/config
  webpack5: {},
})