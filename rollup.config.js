import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'

import pkg from './package.json'

export default {
  input: 'src/index.jsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ],
  external: id => /^react/.test(id),
  plugins: [
    replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    postcss({ extract: true }),
    babel({
      exclude: 'node_modules/**',
    }),
    resolve({
        preferBuiltins: true,
        extensions: ['.js', '.jsx'],
    }),
    commonjs(),
  ]
}
