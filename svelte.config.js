import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		paths: {
			base: '/latihan-bahasa'
		}
	},
	compilerOptions: {
		experimental: { async: true }
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) =>
			filename.includes('node_modules') ? undefined : { runes: true, experimental: { async: true } }
	}
};

export default config;
