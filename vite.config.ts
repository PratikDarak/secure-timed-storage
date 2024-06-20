import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import packageJson from './package.json';

const getPackageNameCamelCase = () => packageJson.name.replace(/-./g, (char) => char[1].toUpperCase());

const packageName = packageJson.name.split('/').pop() || packageJson.name;

export default defineConfig({
	plugins: [dts({ rollupTypes: true })],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			formats: ['es', 'cjs', 'umd', 'iife'],
			name: getPackageNameCamelCase(),
			fileName: packageName,
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
