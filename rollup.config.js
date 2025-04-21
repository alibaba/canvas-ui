/* global __dirname */
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import path from 'path'
import { string } from 'rollup-plugin-string'
import { terser } from 'rollup-plugin-terser'
import analyze from 'rollup-plugin-analyzer'
import typescript from '@rollup/plugin-typescript'
import strip from '@rollup/plugin-strip'

const minify = (name) => {
  return name.replace(/\.(m)?js$/, '.min.$1js')
}

const getPlugins = ({ __PROD__ }) => {
  const res = [
    typescript({

    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    json(),
    analyze({
      summaryOnly: true,
    }),
    string({
      include: [
        '**/*.frag',
        '**/*.vert',
      ],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(__PROD__ ? 'production' : 'development'),
      preventAssignment: true,
    }),
    strip(),
  ]

  if (__PROD__) {
    res.push(
      terser({
        output: {
          comments: (node, comment) => comment.line === 1,
        },
      }),
      strip(),
    )
  }
  return res
}

const main = async () => {
  const packages = [
    {
      name: '@canvas-ui/assert',
      main: 'dist/umd/assert.js',
      external: [],
      basePath: 'packages/assert'
    },
    {
      name: '@canvas-ui/core',
      main: 'dist/umd/core.js',
      external: ['@canvas-ui/assert'],
      basePath: 'packages/core'
    },
    {
      name: '@canvas-ui/react',
      main: 'dist/umd/react.js',
      external: ['react', '@canvas-ui/core'],
      basePath: 'packages/react'
    }
  ]

  return packages
    .map(pkg => {
      return [false, true].map(__PROD__ => {
        const basePath = pkg.basePath
        const input = path.join(basePath, 'src/index.ts')
        const output = {
          name: pkg.name,
          sourcemap: true,
          file: path.join(basePath, pkg.main),
          format: 'umd',
          globals: pkg.external.reduce((acc, it) => {
            acc[it] = it
            return acc
          }, {}),
        }

        if (__PROD__) {
          output.file = minify(output.file)
        }

        return {
          input,
          output,
          external: pkg.external,
          plugins: getPlugins({ __PROD__ }),
        }
      })
    })
    .flat()
}

export default main()
