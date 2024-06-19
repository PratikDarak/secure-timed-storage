import path from 'path';
import { defineConfig } from 'vite';
import packageJson from './package.json';

// export default defineConfig({
// 	plugins: [
// 		dts({
// 			rollupTypes: true,
// 		}),
// 	],
// 	build: {
// 		emptyOutDir: true,
// 		lib: {
// 			entry: resolve(__dirname, 'src/secureTimedStorage.ts'),
// 			name: 'secure-timed-storage',
// 			formats: ['es', 'cjs'],
// 			fileName: (format) => `${format}/index-${format}.js`,
// 		},
// 		rollupOptions: {
// 			external: ['crypto-js'],
// 			output: {
// 				globals: {
// 					'crypto-js': 'CryptoJS',
// 				},
// 			},
// 		},
// 	},
// });

const getPackageName = () => {
	return packageJson.name;
};

const getPackageNameCamelCase = () => {
	try {
		return getPackageName().replace(/-./g, (char) => char[1].toUpperCase());
	} catch (err) {
		throw new Error('Name property in package.json is missing.');
	}
};

const fileName = {
	es: `${getPackageName()}.mjs`,
	cjs: `${getPackageName()}.cjs`,
};

const formats = Object.keys(fileName);

export default defineConfig({
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
