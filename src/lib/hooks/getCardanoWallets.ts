import type { walletOption } from '../types/walletAPI.js';

/**
 * Gets the Cardano wallets.
 *
 * This function first checks if the `window` object and the `cardano` property on the `window` object exist.
 * If they do, it gets the names of the wallets and filters and maps the entries of `window.cardano` to get the wallets.
 * Finally, it resolves the promise with the wallets.
 *
 * @returns {Promise<[string, walletOption][]>} A promise that resolves to an array of tuples, each containing a wallet name and a wallet option.
 */
export function getCardanoWallets(): Promise<[string, walletOption][]> {
	return new Promise((resolve) => {
		let wallets: [string, walletOption][] = [];

		if (typeof window !== 'undefined' && window.cardano) {
			// Get the names of the wallets
			const walletNames = Object.entries(window.cardano)
				.filter(
					([key, value]) => typeof value === 'object' && key !== '_events' && key !== 'typhon'
				)
				.map(([key, value]) => key);

			// Filter and map the entries of window.cardano
			wallets = Object.entries(window.cardano)
				.filter(([key, value]) => typeof value === 'object' && walletNames.includes(key))
				.map(([key, value]) => [key, value]);
		}

		resolve(wallets);
	});
}
