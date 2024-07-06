import * as CryptoJS from 'crypto-js';

interface EncryptedData {
	value: any;
	expiry: number | null;
}

export interface StorageInfo {
	usedBytes: number;
	remainingBytes: number;
}

export interface IStorage {
	setItem(key: string, value: any, expiryInHours?: number | null): void;
	getItem(key: string): any | null;
	removeItem(key: string): void;
	getRemainingStorage(): StorageInfo;
	cleanUp(): void;
	query(predicate: (item: any) => boolean): any[];
}

export interface SecureTimedStorageOptions {
	encryptionKey: string;
}

export function createSecureTimedStorage({ encryptionKey }: SecureTimedStorageOptions): IStorage {
	const setItem = (key: string, value: any, expiryInHours: number | null = null): void => {
		try {
			const expiry = expiryInHours !== null ? Date.now() + expiryInHours * 3600000 : null;
			const encryptedValue = encryptData({ value, expiry });
			localStorage.setItem(key, encryptedValue);
		} catch (error) {
			console.error('Failed to set item', error);
			throw new Error('Failed to set item');
		}
	};

	const getItem = (key: string): any | null => {
		const item = localStorage.getItem(key);
		if (!item) {
			return null;
		}

		try {
			const decryptedValue = decryptData(item);
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

	const getRemainingStorage = (): StorageInfo => {
		const allKeys = Object.keys(localStorage);
		let usedBytes = 0;
		for (const key of allKeys) {
			const value = localStorage.getItem(key);
			if (value) {
				usedBytes += key.length + value.length;
			}
		}
		return { usedBytes, remainingBytes: 5 * 1024 * 1024 - usedBytes }; // 5MB is the typical localStorage limit
	};

	const cleanUp = (): void => {
		const allKeys = Object.keys(localStorage);
		allKeys.forEach((key) => {
			const item = getItem(key);
			if (item && item.expiry && Date.now() > item.expiry) {
				removeItem(key);
			}
		});
	};

	const query = (predicate: (item: any) => boolean): any[] => {
		const allData: any[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key) {
				const item = getItem(key);
				if (item && predicate(item)) {
					allData.push(item);
				}
			}
		}
		return allData;
	};

	const encryptData = (data: EncryptedData): string => {
		try {
			return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
		} catch (error) {
			console.error('Encryption failed', error);
			throw new Error('Encryption failed');
		}
	};

	const decryptData = (ciphertext: string): EncryptedData => {
		try {
			const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
			const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
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
		getRemainingStorage,
		cleanUp,
		query,
	};
}
