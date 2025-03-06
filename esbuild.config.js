import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import { sassPlugin } from 'esbuild-sass-plugin';
import * as esbuild from 'esbuild';

// ESM Build
await esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    write: true,
    outfile: 'dist/index.js', // ESM output
    format: 'esm',
    external: ['react', 'react-dom', 'mobx', 'mobx-react'],
    sourcemap: 'external',
    minify: true,
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

// CommonJS Build
await esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    write: true,
    outfile: 'dist/index.cjs.js', // CommonJS output
    format: 'cjs',
    external: ['react', 'react-dom', 'mobx', 'mobx-react'],
    sourcemap: 'external',
    minify: true,
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
