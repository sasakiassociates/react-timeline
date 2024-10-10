import * as esbuild from 'esbuild'
import {sassPlugin} from "esbuild-sass-plugin";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import postcssPresetEnv from "postcss-preset-env";


let ctx = await esbuild.context({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    write: true,
    outfile:'dist/index.js',
    format: 'esm',
    packages: 'external',
    sourcemap: 'external',
    plugins: [
        sassPlugin({
                type:"style",
                cssImports: true,
                async transform(source, resolveDir) {
                    const {css} = await postcss([autoprefixer, postcssPresetEnv({stage: 0})]).process(source, { from: resolveDir | undefined })
                    return css
                }
            }
        ),

    ]
})

await ctx.watch()
console.log('watching...')