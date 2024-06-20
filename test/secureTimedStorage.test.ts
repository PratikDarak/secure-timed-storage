import { suite, test, assert, beforeEach } from 'vitest';
import { createSecureTimedStorage } from '../src/secureTimedStorage';

const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: function (key: string) {
			return store[key] || null;
		},
		setItem: function (key: string, value: string) {
			store[key] = value.toString();
		},
		removeItem: function (key: string) {
			delete store[key];
		},
		clear: function () {
			store = {};
		},
		key: function (index: number) {
			const keys = Object.keys(store);
			return keys[index] || null;
		},
		get length() {
			return Object.keys(store).length;
		},
	};
})();

// Assign localStorageMock to global.localStorage
global.localStorage = localStorageMock;

suite('Secure Timed Storage', () => {
	let storage: ReturnType<typeof createSecureTimedStorage>;

	beforeEach(() => {
		localStorage.clear();
		const secretKey = 'test_secret_key';
		storage = createSecureTimedStorage({ encryptionKey: secretKey });
	});

	test('should store and retrieve encrypted data', () => {
		const data = { name: 'John Doe' };
		const key = 'myKey';

		storage.setItem(key, data);

		const retrievedData = storage.getItem(key);
		assert.deepEqual(retrievedData, data);
	});

	test('should remove item after expiry time', async () => {
		const data = { name: 'John Doe' };
		const key = 'myKey';

		// Set item with 1 second expiry for testing
		storage.setItem(key, data, 0.0003); // 0.0003 hours = approximately 1 second

		// Wait for 1.5 seconds (1500 ms) to ensure item has expired
		await new Promise((resolve) => setTimeout(resolve, 1500));

		const retrievedData = storage.getItem(key);
		assert.equal(retrievedData, null);
	});

	test('should store and retrieve multiple items', () => {
		const data1 = { name: 'John Doe' };
		const data2 = { name: 'Jane Smith' };
		const key1 = 'key1';
		const key2 = 'key2';

		storage.setItem(key1, data1);
		storage.setItem(key2, data2);

		const retrievedData1 = storage.getItem(key1);
		const retrievedData2 = storage.getItem(key2);

		assert.deepEqual(retrievedData1, data1);
		assert.deepEqual(retrievedData2, data2);
	});

	test('should remove item', () => {
		const data = { name: 'John Doe' };
		const key = 'myKey';

		storage.setItem(key, data);
		storage.removeItem(key);

		const retrievedData = storage.getItem(key);
		assert.equal(retrievedData, null);
	});

	test('should query items based on criteria', () => {
		const data1 = { type: 'user', name: 'John Doe' };
		const data2 = { type: 'admin', name: 'Jane Smith' };
		const key1 = 'user1';
		const key2 = 'admin1';

		storage.setItem(key1, data1);
		storage.setItem(key2, data2);

		const users = storage.query((item) => item?.type === 'user');

		assert.equal(users.length, 1);
		assert.deepEqual(users[0], data1);
	});

	test('should expire item immediately', async () => {
		const data = { name: 'John Doe' };
		const key = 'myKey';

		// Set item with 0 expiry (should expire immediately)
		storage.setItem(key, data, 0);

		await new Promise((resolve) => setTimeout(resolve, 100));

		const retrievedData = storage.getItem(key);
		assert.equal(retrievedData, null);
	});

	test('should handle large data', () => {
		const largeData = { data: 'x'.repeat(5000) }; // Large data string
		const key = 'largeData';

		storage.setItem(key, largeData);

		const retrievedData = storage.getItem(key);
		assert.deepEqual(retrievedData, largeData);
	});
});
