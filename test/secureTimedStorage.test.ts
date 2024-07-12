import { suite, test, assert, beforeEach } from 'vitest';
import { createSecureTimedStorage } from '../src/secureTimedStorage';
import type { IStorage, SecureTimedStorageOptions } from '../src/secureTimedStorage';

let localStorageMock = (() => {
	const store: Record<string, string> = {};

	return {
		store,
		setItem: (key: string, val: string): void => {
			store[key] = val;
		},
		getItem: (key: string): string | null => {
			return store[key] || null;
		},
		removeItem: (key: string): void => {
			delete store[key];
		},
		clear: (): void => {
			Object.keys(store).forEach((key) => {
				delete store[key];
			});
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

// Creating a Proxy to handle Object.keys correctly
localStorageMock = new Proxy(localStorageMock, {
	ownKeys: (target): string[] => {
		return Object.keys(target.store);
	},
	getOwnPropertyDescriptor: (): PropertyDescriptor => {
		return {
			enumerable: true,
			configurable: true,
		};
	},
});

// Replace the global localStorage with the mock
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

suite('Secure Timed Storage', () => {
	let storage: IStorage;
	const encryptionKey = 'test_secret_key';
	const options: SecureTimedStorageOptions = { encryptionKey };

	beforeEach(() => {
		localStorage.clear();
		storage = createSecureTimedStorage(options);
	});

	test('should store and retrieve encrypted data', () => {
		const key = 'myKey';
		const data = { name: 'John Doe' };

		storage.setItem(key, data);

		const retrievedData = storage.getItem<{ name: string }>(key);
		assert.deepEqual(retrievedData, data);
	});

	test('should remove item after expiry time', async () => {
		const key = 'myKey';
		const data = { name: 'John Doe' };

		// Set item with 0.5 second expiry for testing
		storage.setItem(key, data, 0.0001);

		// Wait for 0.5 seconds to ensure item has expired
		await new Promise((resolve) => setTimeout(resolve, 500));

		const retrievedData = storage.getItem<{ name: string }>(key);
		assert.equal(retrievedData, null);
	});

	test('should store and retrieve multiple items', () => {
		const key1 = 'key1';
		const data1 = { name: 'John Doe' };
		const key2 = 'key2';
		const data2 = { name: 'Jane Smith' };

		storage.setItem(key1, data1);
		storage.setItem(key2, data2);

		const retrievedData1 = storage.getItem<{ name: string }>(key1);
		const retrievedData2 = storage.getItem<{ name: string }>(key2);

		assert.deepEqual(retrievedData1, data1);
		assert.deepEqual(retrievedData2, data2);
	});

	test('should remove item', () => {
		const key = 'myKey';
		const data = { name: 'John Doe' };

		storage.setItem(key, data);
		storage.removeItem(key);

		const retrievedData = storage.getItem<{ name: string }>(key);
		assert.equal(retrievedData, null);
	});

	test('should accurately calculate remaining storage', () => {
		const key1 = 'key1';
		const data1 = 'a'.repeat(1000);
		const key2 = 'key2';
		const data2 = 'b'.repeat(1000);

		storage.setItem(key1, data1);
		storage.setItem(key2, data2);

		const expectedUsedBytes = key1.length + key2.length + (localStorage.getItem(key1)?.length || 0) + (localStorage.getItem(key2)?.length || 0);

		const storageInfo = storage.getRemainingStorage();

		assert.equal(storageInfo.usedBytes, expectedUsedBytes);
		assert.equal(storageInfo.remainingBytes, 5 * 1024 * 1024 - expectedUsedBytes); // Assuming 5MB limit
	});

	test('should remove expired items during clean up', async () => {
		const key = 'myKey';
		const data = { name: 'John Doe' };

		// Set item with 0.5 second expiry for testing
		storage.setItem(key, data, 0.0001);

		assert.isNotNull(localStorage.getItem(key));

		// Wait for 0.5 seconds to ensure item has expired
		await new Promise((resolve) => setTimeout(resolve, 500));

		storage.cleanUp();

		assert.isNull(localStorage.getItem(key));
	});

	test('should query items based on criteria', () => {
		const key1 = 'user1';
		const data1 = { type: 'user', name: 'John Doe' };
		const key2 = 'admin1';
		const data2 = { type: 'admin', name: 'Jane Smith' };

		storage.setItem(key1, data1);
		storage.setItem(key2, data2);

		const users = storage.query<{ type: string; name: string }>((item) => item?.type === 'user');

		assert.equal(users.length, 1);
		assert.deepEqual(users[0], data1);
	});

	test('should expire item immediately', async () => {
		const key = 'myKey';
		const data = { name: 'John Doe' };

		// Set item with 0 expiry (should expire immediately)
		storage.setItem(key, data, 0);

		await new Promise((resolve) => setTimeout(resolve, 100));

		const retrievedData = storage.getItem<{ name: string }>(key);
		assert.equal(retrievedData, null);
	});

	test('should handle large data', () => {
		const key = 'largeData';
		const largeData = { data: 'x'.repeat(5000) }; // Large data string

		storage.setItem(key, largeData);

		const retrievedData = storage.getItem<{ data: string }>(key);
		assert.deepEqual(retrievedData, largeData);
	});

	test('should fail to get item if the data is manually edited to an invalid state in localStorage', () => {
		const key = 'myKey';
		const data = { name: 'John Doe' };

		storage.setItem(key, data, 1);

		// Manually edit the item in localStorage to an invalid state
		localStorage.setItem(key, 'invalid data');

		const result = storage.getItem<{ name: string }>(key);
		assert.equal(result, null);
	});

	test('should handle error when setting an item with invalid encryption key', () => {
		const encryptionKey: any = null; // Temporarily modify the encryption key to an invalid one
		const invalidStorage = createSecureTimedStorage({ encryptionKey });

		const key = 'myKey';
		const data = { name: 'John Doe' };

		try {
			invalidStorage.setItem(key, data, 1);
		} catch (error) {
			assert.instanceOf(error, Error);
			assert.equal(error.message, 'Failed to set item');
		}

		// Ensure that no item is stored in localStorage
		const storedItem = localStorage.getItem(key);
		assert.equal(storedItem, null);
	});
});
