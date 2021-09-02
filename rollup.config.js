/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from 'path'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import license from 'rollup-plugin-license'
import resolve from 'rollup-plugin-node-resolve'
import { uglify } from 'rollup-plugin-uglify'
import alias from '@rollup/plugin-alias'
import cleanup from 'rollup-plugin-cleanup'

import LicenseBanner from './license.js'

export default [
  {
    input: './src/thunderJS.js',
    output: {
      file: './dist/thunderJS.js',
      format: 'iife',
      name: 'ThunderJS',
    },
    plugins: [
      alias({
        entries: {
          ws: path.join(__dirname, 'alias/ws.js'),
        },
      }),
      resolve({ browser: true }),
      commonjs(),
      babel(),
      uglify(),
      license({
        banner: {
          content: LicenseBanner,
        },
      }),
    ],
  },
  {
    input: './src/thunderJS.js',
    output: {
      file: './dist/thunderJS.mjs',
      name: 'ThunderJS',
    },
    plugins: [
      alias({
        entries: {
          ws: path.join(__dirname, 'alias/ws.js'),
        },
      }),
      resolve({ browser: true }),
      commonjs(),
      cleanup(),
      license({
        banner: {
          content: LicenseBanner,
        },
      }),
    ],
  },
  {
    input: './src/thunderJS.js',
    output: {
      file: './dist/thunderJS.cjs',
      format: 'cjs',
      name: 'ThunderJS',
    },
    plugins: [
      alias({
        entries: {
          ws: path.join(__dirname, 'alias/ws.js'),
        },
      }),
      resolve({ browser: true }),
      commonjs(),
      cleanup(),
      license({
        banner: {
          content: LicenseBanner,
        },
      }),
    ],
  },
]
