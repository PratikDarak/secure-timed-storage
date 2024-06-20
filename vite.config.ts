import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import packageJson from './package.json';

const getPackageName = () => {
	return packageJson.name;
};

const fileName = {
	es: `${getPackageName()}.mjs`,
	cjs: `${getPackageName()}.cjs`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

export default defineConfig({
	plugins: [dts({ rollupTypes: true })],
	build: {
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
