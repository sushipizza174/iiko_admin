// import adapter from '@sveltejs/adapter-static';
// 
// /** @type {import('@sveltejs/kit').Config} */
// const config = { kit: { adapter: adapter() } };
// 
// export default config;
import adapter from '@sveltejs/adapter-static';
//import { vitePreprocess } from '@sveltejs/kit/vite';

export default {
	//preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'data',
			assets: 'data',
			fallback: 'index.html',
			precompress: false,
			strict: true
		})
	}
};