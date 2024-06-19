import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [
		dts({
			rollupTypes: true,
		}),
	],
	build: {
		emptyOutDir: true,
		lib: {
			entry: resolve(__dirname, 'src/secureTimedStorage.ts'),
			name: 'secure-timed-storage',
			formats: ['es', 'cjs'],
			fileName: (format) => `${format}/index-${format}`,
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
