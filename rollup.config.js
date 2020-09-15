import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import typescript2 from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy'

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;
	
	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default [
	production && {
		// Configuration for combined js file
		input: 'src/router/index.js',
		output: [
			{
				sourcemap: false,
				format: 'iife',
				name: 'app',
				file: 'public/npm/bundle.js'
			}
		],
		plugins: [
			svelte({
				// https://github.com/sveltejs/svelte-preprocess/blob/master/docs/getting-started.md
				css: false,
				preprocess: sveltePreprocess({
					sourceMap: !production,
					defaults: {
				        // markup: 'pug',
				        script: 'typescript',
				        // style: 'scss'
					},
				}),
			}),

			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration -
			// consult the documentation for details:
			// https://github.com/rollup/plugins/tree/master/packages/commonjs
			// resolve({
			// 	browser: true,
			// 	dedupe: ['svelte']
			// }),
			commonjs(),
			typescript({
				sourceMap: !production,
				inlineSources: !production
			}),
			terser()
		],
	},
	production && {
		// Npm package with svelte components
		input: 'src/router/Router.ts',
		output: [
			{
				sourcemap: false,
				format: 'iife',
				name: 'app',
				file: 'public/npm/router.js'
			}
		],
		plugins: [
			svelte({
				// https://github.com/sveltejs/svelte-preprocess/blob/master/docs/getting-started.md
				css: false,
				preprocess: sveltePreprocess({
					sourceMap: !production,
					defaults: {
				        // markup: 'pug',
				        script: 'typescript',
				        // style: 'scss'
					},
				}),
			}),

			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration -
			// consult the documentation for details:
			// https://github.com/rollup/plugins/tree/master/packages/commonjs
			resolve({
				browser: true,
				dedupe: ['svelte']
			}),
			commonjs(),
			typescript2({
				tsconfigOverride: {
					include: ["src/router/router.ts"],
					compilerOptions: {
						declaration: true,
						// declarationDir: "public/npm/types"
					}
				},
				clean: true
			}),
			// If we're building for production (npm run build
			// instead of npm run dev), minify
			production && terser(),
			copy({
				targets: [
					{ src: 'src/router/sveltecomponents.js', dest: 'public/npm' },
					{ src: 'src/router/RouterLink.svelte', dest: 'public/npm' },
					{ src: 'src/router/RouterSlot.svelte', dest: 'public/npm' }
				]
			})
		],
	},
	{
		input: 'src/main.ts',
		output: [
			{
				sourcemap: false,
				format: 'iife',
				name: 'app',
				file: 'public/build/bundle.js'
			}
		],
		plugins: [
			svelte({
				// enable run-time checks when not in production
				dev: !production,
				// we'll extract any component CSS out into
				// a separate file - better for performance
				css: css => {
					css.write('bundle.css');
				},
				preprocess: sveltePreprocess({
					sourceMap: !production,
					defaults: {
				        // markup: 'pug',
				        script: 'typescript',
				        // style: 'scss'
					},
				}),
			}),

			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration -
			// consult the documentation for details:
			// https://github.com/rollup/plugins/tree/master/packages/commonjs
			resolve({
				browser: true,
				dedupe: ['svelte']
			}),
			commonjs(),
			typescript({
				sourceMap: !production,
				inlineSources: !production
			}),

			// In dev mode, call `npm run start` once
			// the bundle has been generated
			!production && serve(),

			// Watch the `public` directory and refresh the
			// browser on changes when not in production
			!production && livereload('public'),

			// If we're building for production (npm run build
			// instead of npm run dev), minify
			production && terser()
		],
		watch: {
			clearScreen: false,
			chokidar: {
				usePolling: true
			}
		}
	}
];
