import CryptoJS from 'crypto-js';

interface EncryptedData<T> {
	value: T;
	expiry: number | null;
}

export interface StorageInfo {
	usedBytes: number;
	remainingBytes: number;
}

export interface IStorage {
	setItem(key: string, value: unknown, expiryInHours?: number | null): void;
	getItem<T>(key: string): T | null;
	removeItem(key: string): void;
	getExpiry(key: string): number | null;
	getRemainingStorage(): StorageInfo;
	clearStorage(): void;
	cleanUp(): void;
	query<T>(predicate: (item: T) => boolean): T[];
}

export interface SecureTimedStorageOptions {
	encryptionKey?: string;
}

export function createSecureTimedStorage({ encryptionKey }: SecureTimedStorageOptions): IStorage {
	const isEncryptionEnabled = !!encryptionKey;

	const setItem = (key: string, value: unknown, expiryInHours: number | null = null): void => {
		try {
			const expiry = expiryInHours !== null ? Date.now() + expiryInHours * 3600000 : null;
			const encryptedValue = isEncryptionEnabled ? encryptData({ value, expiry }) : JSON.stringify({ value, expiry });
			localStorage.setItem(key, encryptedValue);
		} catch (error) {
			console.error('Failed to set item', error);
			throw new Error('Failed to set item');
		}
	};

	const getItem = <T>(key: string): T | null => {
		const item = localStorage.getItem(key);
		if (!item) {
			return null;
		}

		try {
			const decryptedValue = isEncryptionEnabled ? decryptData<T>(item) : JSON.parse(item);
			if (decryptedValue.expiry && Date.now() > decryptedValue.expiry) {
				localStorage.removeItem(key);
				return null;
			}
			return decryptedValue.value;
		} catch (error) {
			console.error('Failed to get item', error);
			return null;
		}
	};

	const removeItem = (key: string): void => {
		localStorage.removeItem(key);
	};

	const getExpiry = (key: string): number | null => {
		const item = localStorage.getItem(key);
		if (!item) {
			return null;
		}

		try {
			const decryptedValue = isEncryptionEnabled ? decryptData<unknown>(item) : JSON.parse(item);
			return decryptedValue.expiry;
		} catch (error) {
			console.error('Failed to get expiry', error);
			return null;
		}
	};

	const getRemainingStorage = (): StorageInfo => {
		const usedBytes = Object.keys(localStorage).reduce((total, key) => {
			const value = localStorage.getItem(key);
			return value ? total + key.length + value.length : total;
		}, 0);
		return { usedBytes, remainingBytes: 5 * 1024 * 1024 - usedBytes }; // 5MB is the typical localStorage limit
	};

	const clearStorage = (): void => {
		localStorage.clear();
	};

	const cleanUp = (): void => {
		Object.keys(localStorage).forEach((key) => {
			const item = getItem<EncryptedData<unknown>>(key);
			if (item?.expiry && Date.now() > item.expiry) {
				removeItem(key);
			}
		});
	};

	const query = <T>(predicate: (item: T) => boolean): T[] => {
		const allData: T[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key) {
				const item = getItem<T>(key);
				if (item && predicate(item)) {
					allData.push(item);
				}
			}
		}
		return allData;
	};

	const encryptData = (data: EncryptedData<unknown>): string => {
		try {
			return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey!).toString();
		} catch (error) {
			console.error('Encryption failed', error);
			throw new Error('Encryption failed');
		}
	};

	const decryptData = <T>(ciphertext: string): EncryptedData<T> => {
		try {
			const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey!);
			const decryptedData: EncryptedData<T> = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
			return decryptedData;
		} catch (error) {
			console.error('Decryption failed', error);
			throw new Error('Decryption failed');
		}
	};

	return {
		setItem,
		getItem,
		removeItem,
		getExpiry,
		getRemainingStorage,
		clearStorage,
		cleanUp,
		query,
	};
}
