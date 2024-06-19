import path from 'path';
import { defineConfig } from 'vite';
import packageJson from './package.json';

const getPackageName = () => {
	return packageJson.name;
};

const fileName = {
	es: `${getPackageName()}.mjs`,
	cjs: `${getPackageName()}.cjs`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

module.exports = defineConfig({
	build: {
		emptyOutDir: true,
		outDir: './dist',
		lib: {
			entry: path.resolve(__dirname, 'src/secureTimedStorage.ts'),
			name: getPackageName(),
			formats,
			fileName: (format) => fileName[format],
		},
		rollupOptions: {
			external: ['crypto-js'],
			output: {
				globals: {
					'crypto-js': 'CryptoJS',
				},
			},
		},
	},
});
