/* global __dirname */
import batchPackages from '@lerna/batch-packages'
import { filterPackages } from '@lerna/filter-packages'
import { getPackages } from '@lerna/project'
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

/**
 * 获得排序后的 packages
 * https://github.com/lerna/lerna/issues/1848#issuecomment-451762317
 */
async function getSortedPackages(scope, ignore) {
  const packages = await getPackages(__dirname)
  const filtered = filterPackages(packages, scope, ignore, false)
  return batchPackages(filtered).reduce((arr, batch) => arr.concat(batch), [])
}

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
  const packages = await getSortedPackages()
  return packages
    .filter(pkg => !!pkg.get('main'))
    .map(pkg => {
      return [false, true].map(__PROD__ => {
        const external = Object.keys(pkg.peerDependencies || [])
        const globals = external.reduce((acc, dep) => {
          acc[dep] = dep
          return acc
        }, {})
        const basePath = path.relative(__dirname, pkg.location)
        const input = path.join(basePath, 'src/index.ts')
        const output = {
          name: pkg.name,
          sourcemap: true,
          file: path.join(basePath, pkg.get('main')),
          format: 'umd',
          globals,
        }

        if (__PROD__) {
          output.file = minify(output.file)
        }

        return {
          input,
          output,
          external,
          plugins: getPlugins({ __PROD__ }),
        }
      })
    })
    .flat()
}

export default main()
