import * as esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';

// Create two contexts, one for ESM and one for CommonJS
const esmCtx = await esbuild.context({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    write: true,
    outfile: 'dist/index.js', // ESM output
    format: 'esm',
    sourcemap: 'external',
    external: ['react', 'react-dom', 'mobx', 'mobx-react'],
    plugins: [
        sassPlugin({
            type: 'style',
            cssImports: true,
            async transform(source, resolveDir) {
                try {
                    const { css } = await postcss([autoprefixer, postcssPresetEnv({ stage: 0 })]).process(source, {
                        from: resolveDir | undefined,
                    });
                    return css;
                } catch (error) {
                    console.error('Error processing CSS:', error);
                    throw error;
                }
            },
        }),
    ],
});

const cjsCtx = await esbuild.context({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    write: true,
    outfile: 'dist/index.cjs.js', // CommonJS output
    format: 'cjs',
    sourcemap: 'external',
    external: ['react', 'react-dom', 'mobx', 'mobx-react'],
    plugins: [
        sassPlugin({
            type: 'style',
            cssImports: true,
            async transform(source, resolveDir) {
                try {
                    const { css } = await postcss([autoprefixer, postcssPresetEnv({ stage: 0 })]).process(source, {
                        from: resolveDir | undefined,
                    });
                    return css;
                } catch (error) {
                    console.error('Error processing CSS:', error);
                    throw error;
                }
            },
        }),
    ],
});

// Watch both contexts
await esmCtx.watch();
await cjsCtx.watch();
console.log('watching...');