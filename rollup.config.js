import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser as minimize } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import typescript2 from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
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
let options = [
	production && {
		// Combined js file
		input: 'src/router/index.js',
		output: [
			{
				sourcemap: false,
				format: 'es',
				name: 'app',
				file: 'public/npm/bundle.js',
				indent: false
			}
		],
		plugins: [
			svelte({
				// https://github.com/sveltejs/svelte-preprocess/blob/master/docs/getting-started.md
				css: false,
				preprocess: sveltePreprocess({
					sourceMap: !production,
					defaults: {
				        script: 'typescript',
					},
				}),
			}),
			nodeResolve(),
			commonjs(),
			typescript({
				sourceMap: !production,
				inlineSources: !production
			}),
			minimize(),
		],
	},
	production && {
		// To use with svelte components + module
		input: 'src/router/Router.ts',
		output: [
			{
				sourcemap: false,
				format: 'es',
				name: 'app',
				file: 'public/npm/Router.js'
			}
		],
		plugins: [
			svelte({
				// https://github.com/sveltejs/svelte-preprocess/blob/master/docs/getting-started.md
				css: false,
				preprocess: sveltePreprocess({
					sourceMap: !production,
					defaults: {
				        script: 'typescript',
					},
				}),
			}),
			nodeResolve(),
			commonjs(),
			typescript2({
				tsconfigOverride: {
					include: ["src/router/Router.ts"],
					compilerOptions: {
						declaration: true,
						// declarationDir: "public/npm/types"
					}
				},
				clean: true
			}),
			// minimize(),
			copy({
				targets: [
					{ src: 'src/router/index.js', dest: 'public/npm' },
					{ src: 'src/router/RouterLink.svelte', dest: 'public/npm' },
					{ src: 'src/router/RouterSlot.svelte', dest: 'public/npm' },
				]
			})
		],
	},
	{
		// for development svelte-micro-router + app.svelte sample code
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
				dev: true,
				css: false,
				preprocess: sveltePreprocess({
					sourceMap: false,
					defaults: {
				        // markup: 'pug',
				        script: 'typescript',
				        // style: 'scss'
					},
				}),
			}),
			nodeResolve(),
			// https://github.com/rollup/plugins/tree/master/packages/commonjs
			resolve({
				browser: true,
				dedupe: ['svelte']
			}),
			commonjs(),
			typescript({
				sourceMap: false,
				inlineSources: false
			}),
			!production && serve(),
			!production && livereload('public'),
		],
		watch: {
			clearScreen: false,
			chokidar: {
				usePolling: true
			}
		}
	}
].filter(x => x != false);
export default options;