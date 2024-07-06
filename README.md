# Secure Timed Storage

Secure Timed Storage is a TypeScript library for securely encrypting and managing data in the browser's localStorage with expiration functionality. It provides an easy-to-use API to store sensitive or temporary data securely.

## Description

Local storage in browsers is a useful feature for storing data on the client side, but it has two major concerns:
1. **Data Security**: By default, data stored in local storage is not encrypted, making it accessible to anyone who has access to the browser’s developer tools. This lack of security can be problematic when storing sensitive information such as authentication tokens, user details, or other confidential data.
2. **Expiry Management**: Local storage does not natively support setting expiry times for stored items. Data stored remains until explicitly removed, which can lead to outdated or stale data persisting indefinitely.

Secure Timed Storage addresses these issues by:
- **Encrypting Data**: Ensuring that all data stored in local storage is securely encrypted using AES encryption from the `crypto-js` library. This protects sensitive information from being easily accessed or tampered with.
- **Setting Expiry Times**: Allowing developers to specify an expiration time for each stored item. The library automatically handles the removal of expired data, ensuring that local storage only contains relevant and up-to-date information.

## Features

- **Encryption**: Encrypts data before storing it in localStorage using AES encryption from `crypto-js`.
- **Decryption**: Decrypts data when retrieving it from localStorage.
- **Expiry**: Supports setting an expiry time for stored data, automatically removing it after expiration.
- **TypeScript Support**: Fully written in TypeScript for type safety and enhanced developer experience.
- **Modern JavaScript**: Utilizes ES Modules for modern JavaScript environments.
- **Developer Friendly**: Built with ease of integration and simplicity in mind.

## Installation

To install the library, you can use npm or yarn:

```bash
npm install secure-timed-storage
# or
yarn add secure-timed-storage
```

## Usage

Importing the Library
```bash
import { createSecureTimedStorage } from 'secure-timed-storage';
```

Initializing Secure Timed Storage
```bash
const secretKey = 'your_secret_key_here';
const storage = createSecureTimedStorage({ encryptionKey: secretKey });
```

Storing Data
```bash
# Store data with an optional expiry time in hours
storage.setItem('myKey', { name: 'John Doe' }, 1); # Expires in 1 hour
```

Retrieving Data
```bash
const data = storage.getItem('myKey');
console.log(data); # { name: 'John Doe' }
```

Removing Data
```bash
storage.removeItem('myKey');
```

## Additional Methods

- **getRemainingStorage()**: Retrieves information about remaining localStorage capacity.
- **cleanUp()**: Removes expired data from localStorage.
- **query(predicate: (item: any) => boolean)**: Queries and retrieves data based on a predicate function.

## Example

Here's a simple example demonstrating basic usage:
```bash
import { createSecureTimedStorage } from 'secure-timed-storage';

const secretKey = 'your_secret_key_here';
const storage = createSecureTimedStorage({ encryptionKey: secretKey });

# Store data with an expiry of 1 hour
storage.setItem('userToken', { token: 'abc123' }, 1);

# Retrieve the stored data
const token = storage.getItem('userToken');
console.log(token); # { token: 'abc123' }

# Clean up expired data (optional)
storage.cleanUp();
```

## Error Handling
The library includes error handling for encryption and decryption failures. For example, if the encryption key is invalid or the data in localStorage is tampered with, appropriate errors are thrown and logged.
```bash
try {
    storage.setItem('invalidKey', { foo: 'bar' }, 1);
} catch (error) {
    console.error('Failed to set item:', error.message);
}

const data = storage.getItem('invalidKey');
if (data === null) {
    console.warn('Failed to retrieve item or item has expired.');
}
```

## Contributing

Contributions are welcome! Please follow these guidelines before contributing:

1. Fork the repository and clone it locally.
2. Install dependencies with `npm install` or `yarn install`.
3. Create a new branch for your feature or bug fix: `git checkout -b feature/my-feature` or `git checkout -b bugfix/issue-fix`.
4. Make your changes and ensure they follow the code style (linting) and tests pass.
5. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/).
6. Push to your forked repository and submit a pull request against the `main` branch of the original repository.

## Development Scripts

- **Build**: `npm run build` - Compiles TypeScript files and builds the project.
- **Lint**: `npm run lint` - Lints TypeScript files using ESLint.
- **Format**: `npm run format` - Formats TypeScript files using Prettier.
- **Test**: `npm run test` - Runs the test cases using Vitest.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the need for secure data storage in browser environments.
- Uses `crypto-js` library for encryption.
