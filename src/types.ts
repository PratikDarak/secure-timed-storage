export interface EncryptedData {
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
