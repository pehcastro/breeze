/* eslint-disable @typescript-eslint/ban-ts-comment */
// src/lib/store/index.ts

import { writable, get } from 'svelte/store';
import type { walletAPI, walletOption, Wallet as WalletType } from '../types/walletAPI.js';
import { getCardanoWallets } from '../hooks/getCardanoWallets.ts';
import { enableCardanoWallet } from '../hooks/enableCardanoWallet.ts';

// Create writable stores with initial values
const list = writable<[string, walletOption][]>([]);
const selected = writable<walletOption | undefined>(undefined);
const isConnected = writable<boolean>(false);

class WalletInstance implements WalletType {
	constructor(private api: walletAPI) {}

	/**
	 * Returns the network id of the currently connected account. 0 is
	 * testnet and 1 is mainnet but other networks
	 *  can possibly be returned by wallets.
	 * Those other network ID values are not governed by this document.
	 * This result will stay the same unless the connected account has changed.
	 *
	 * @returns {Promise<number>} A promise that resolves to the network ID.
	 * @throws {Error} Throws an error if unable to retrieve the network ID.
	 */
	async getNetworkId() {
		return this.api.getNetworkId();
	}

	/**
	 * Gets the unspent transaction outputs (UTXOs).
	 *
	 * If amount is undefined, this returns a list of all UTXOs controlled by the wallet.
	 * If amount is not undefined, this request is limited to just the UTXOs
	 * that are required to reach the combined ADA/multiasset value target specified in amount.
	 * If this cannot be attained, undefined is returned.
	 * The results can be further paginated by paginate if it is not undefined.
	 *
	 * @param {string} [amount] - The minimum amount of ADA to filter the UTXOs. Optional.
	 * @param {Paginate} [paginate] - An object containing pagination options. Optional.
	 * @returns {Promise<TransactionUnspentOutput[] | undefined >} A promise that resolves to an array of UTXOs or undefined.
	 * @throws {Error} Throws an error if unable to retrieve the UTXOs.
	 */
	async getUtxos(amount?: string, paginate?: Paginate) {
		return this.api.getUtxos(amount, paginate);
	}

	/**
	 * Gets the total balance available of the wallet.
	 *
	 * This is the same as summing the results of api.getUtxos(), but it is both useful to dApps and likely already maintained by the implementing wallet in a more efficient manner so it has been included in the API as well.
	 *
	 * @returns {Promise<cbor<string>>} A promise that resolves to the balance of the wallet in CBOR format.
	 * @throws {APIError} Throws an APIError if unable to retrieve the balance.
	 */
	async getBalance() {
		return this.api.getBalance();
	}

	/**
	 * Returns a list of all used (included in some on-chain transaction) addresses controlled by the wallet.
	 * The results can be further paginated by paginate if it is not undefined.
	 *
	 * @param {Paginate} [paginate] - An object containing pagination options. Optional.
	 * @returns {Promise<string[]>} A promise that resolves to an array of used addresses.
	 * @throws {Error} Throws an error if unable to retrieve the used addresses.
	 */
	async getUsedAddresses(paginate?: Paginate) {
		return this.api.getUsedAddresses(paginate);
	}

	/**
	 * Returns a list of unused addresses controlled by the wallet.
	 *
	 * @returns {Promise<string[]>} A promise that resolves to an array of unused addresses.
	 * @throws {Error} Throws an error if unable to retrieve the unused addresses.
	 */
	async getUnusedAddresses() {
		return this.api.getUnusedAddresses();
	}

	/**
	 * Returns an address owned by the wallet that should be used as a change address to return leftover assets
	 * during transaction creation back to the connected wallet.
	 * This can be used as a generic receive address as well.
	 *
	 * @returns {Promise<cbor<string>>} A promise that resolves to the change address in cbor format.
	 * @throws {Error} Throws an error if unable to retrieve the change address.
	 */
	async getChangeAddress() {
		return this.api.getChangeAddress();
	}

	/**
	 * Returns the reward addresses owned by the wallet.
	 *  This can return multiple addresses e.g. CIP-0018.
	 *
	 * @returns {Promise<cbor<string[]>>} A promise that resolves to an array of reward addresses.
	 * @throws {Error} Throws an error if unable to retrieve the reward addresses.
	 */
	async getRewardAddresses() {
		return this.api.getRewardAddresses();
	}

	/**
	 * Requests that a user sign the unsigned portions of the supplied transaction.
	 * The wallet should ask the user for permission, and if given, try to sign the supplied body and
	 * return a signed transaction. If partialSign is true, the wallet only tries to sign what it can.
	 * If partialSign is false and the wallet could not sign the entire transaction, TxSignError shall
	 * be returned with the ProofGeneration code. Likewise if the user declined in either case it shall
	 * return the UserDeclined code. Only the portions of the witness set that were signed as a result of
	 * this call are returned to encourage dApps to verify the contents returned by this endpoint while
	 * building the final transaction.
	 *
	 * @param {string} tx - The transaction to sign.
	 * @param {boolean} [partialSign] - Whether to partially sign the transaction. Optional.
	 * @returns {Promise<string>} A promise that resolves to the signed transaction.
	 * @throws {Error} Throws an error if unable to sign the transaction.
	 */
	async signTx(tx: string, partialSign?: boolean) {
		return this.api.signTx(tx, partialSign);
	}

	/**
 * This endpoint utilizes the CIP-0008 signing spec for standardization/safety reasons.
 *  It allows the dApp to request the user to sign data conforming to said spec. 
 * The user's consent should be requested and the details of sig_structure shown to
 *  them in an informative way. The Please refer to the CIP-0008 spec for details on 
 * how to construct the sig structure
The return value has the following form:
 *@type DataSignature = {
    signature: cbor<COSE_Sign1>,
    key: cbor<COSE_Key>,
};
 * @param {string} address - The address to use for signing.
 * @param {string} payload - The data to sign.
 * @returns {Promise<DataSignature>} A promise that resolves to the signed data.
 * @throws {Error} Throws an error if unable to sign the data.
 */
	async signData(address: string, payload: string) {
		return this.api.signData(address, payload);
	}

	/**
	 * As wallets should already have this ability, we allow dApps to request that a
	 * transaction be sent through it. If the wallet accepts the transaction and tries
	 *  to send it, it shall return the transaction id for the dApp to track. The wallet
	 *  is free to return the TxSendError with code Refused if they do not wish to send it,
	 *  or Failure if there was an error in sending it (e.g. preliminary checks failed on signatures).
	 *
	 * @param {string} tx - The transaction to submit.
	 * @returns {Promise<string>} A promise that resolves to the transaction ID.
	 * @throws {Error} Throws an error if unable to submit the transaction.
	 */
	async submitTx(tx: string) {
		return this.api.submitTx(tx);
	}

	/**
	 * NON-STANDARD - EXPERIMENTAL SUPPORT
	 * Gets the collateral of the wallet.
	 *
	 * @returns {Promise<TransactionUnspentOutput[] | undefined>} A promise that resolves to the collateral or undefined.
	 * @throws {Error} Throws an error if unable to retrieve the collateral.
	 */
	async getCollateral() {
		return this.api.getCollateral();
	}

	experimental = {
		getCollateral: async () => {
			return this.api.experimental.getCollateral();
		},
		on: (eventName: string, callback: (...args: unknown[]) => void) => {
			this.api.experimental.on(eventName, callback);
		},
		off: (eventName: string, callback: (...args: unknown[]) => void) => {
			this.api.experimental.off(eventName, callback);
		}
	};

	/**
	 * Gets the address of the wallet in the specified format.
	 *
	 * This function first gets the raw change address from the API, then decodes it into bytes and converts it into a Cardano address.
	 * It then checks if the address is a valid base address and if it has a valid stake credential and stake key.
	 * Finally, it converts the address into the specified format and returns it.
	 *
	 * @param {string} [format='bech32'] - The format to return the address in. Can be 'cbor', 'bytes', 'stakehex', 'stakekey', or 'bech32'. Defaults to 'bech32'.
	 * @returns {Promise<string | Uint8Array>} A promise that resolves to the address in the specified format.
	 * @throws {Error} Throws an error if unable to retrieve the address, or if the address, stake credential, or stake key is invalid.
	 */
	async getAddress(format = 'bech32') {
		try {
			const rawAddress = await this.api.getChangeAddress();
			const addressBytes = new Uint8Array(
				rawAddress.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
			);
			const address = (window as any).Cardano.Address.from_bytes(addressBytes);
			const baseAddress = (window as any).Cardano.BaseAddress.from_address(address);
			if (!baseAddress) {
				throw new Error('Invalid base address');
			}
			const stakeCredential = baseAddress.stake_cred();
			if (!stakeCredential) {
				throw new Error('Invalid stake credential');
			}
			const stakeKeyHash = stakeCredential.to_keyhash();
			if (!stakeKeyHash) {
				throw new Error('Invalid stake key');
			}
			const stakeKeyHex =
				'e1' +
				Array.from(stakeKeyHash.to_bytes())
					.map((b) => b.toString(16).padStart(2, '0'))
					.join('');
			const rewardAddressBytes = new Uint8Array(29);
			rewardAddressBytes.set([0xe1], 0);
			rewardAddressBytes.set(stakeKeyHash.to_bytes(), 1);
			const rewardAddress = (window as any).Cardano.RewardAddress.from_address(
				(window as any).Cardano.Address.from_bytes(rewardAddressBytes)
			);
			const stakeKeyBech32 = rewardAddress.to_address().to_bech32();
			switch (format) {
				case 'cbor':
					return rawAddress;
				case 'bytes':
					return addressBytes;
				case 'stakehex':
					return stakeKeyHex;
				case 'stakekey':
					return stakeKeyBech32;
				case 'bech32':
				default:
					return address.to_bech32();
			}
		} catch (error) {
			console.error('Error getting address:', error);
		}
	}

	/**
	 * Gets the assets of the wallet in the specified type.
	 *
	 * This function first gets the balance from the API in CBOR format, then decodes it into bytes and converts it into a Cardano value.
	 * It then checks if the value has a multiasset and throws an error if it doesn't.
	 * It then converts the multiasset into a JSON object and decodes the asset names into strings.
	 * It then creates a list of assets, each with a policy ID, hex name, asset name, and quantity.
	 * Finally, it filters the list of assets based on the specified type and returns the filtered list.
	 *
	 * @param {string} [type='lovelace'] - The type of assets to get. Can be 'lovelace', 'ada', 'ft', 'nft', 'asset', 'handles', or 'policy'. Defaults to 'lovelace'.
	 * @param {string} [policyIdValue=''] - The policy ID value of the assets to get. Defaults to an empty string.
	 * @returns {Promise<string | number | object[]>} A promise that resolves to the assets of the specified type.
	 * @throws {Error} Throws an error if unable to retrieve the assets, if the wallet has no tokens, or if the type is invalid.
	 */
	async getAssets(type = 'lovelace', policyIdValue = '') {
		try {
			const balanceCbor = await this.api.getBalance();
			const balanceBytes = new Uint8Array(
				balanceCbor.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
			);
			const balance = (window as any).Cardano.Value.from_bytes(balanceBytes);
			const multiAsset = balance.multiasset();

			if (!multiAsset) {
				switch (type) {
					case 'lovelace':
					case 'ada':
						return '0';
					case 'handles':
						return [];
					default:
						return 'This wallet has no tokens';
				}
			}

			const multiAssetJson = multiAsset.to_json();
			const multiAssetObj = JSON.parse(multiAssetJson);
			const decoder = new TextDecoder('utf8');

			const assetList = [];
			for (const policyId in multiAssetObj) {
				const assets = multiAssetObj[policyId];
				for (const hexName in assets) {
					const quantity = assets[hexName];
					const assetNameBytes = new Uint8Array(
						hexName.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
					);
					const assetName = decoder.decode(assetNameBytes);
					assetList.push({ policyId, hexName, assetName, quantity });
				}
			}

			switch (type) {
				case 'lovelace': {
					const lovelace = balance.coin().to_str();
					return lovelace === '0' ? '0' : lovelace;
				}
				case 'ada': {
					const ada = balance.coin().to_str() / 1000000;
					return ada === 0 ? '0' : ada;
				}
				case 'ft':
					return assetList.filter((asset) => parseInt(asset.quantity) > 1);
				case 'nft':
					return assetList.filter((asset) => parseInt(asset.quantity) === 1);
				case 'asset':
					return assetList;
				case 'handles': {
					const handles = assetList.filter(
						(asset) => asset.policyId === 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a'
					);
					return handles.length === 0 ? new Error('This wallet has no handles') : handles;
				}
				case 'policy':
					return assetList.filter((asset) => asset.policyId === policyIdValue);
				default:
					throw new Error('Invalid type');
			}
		} catch (error) {
			console.error('Error getting assets:', error);
		}
	}

	/**
	 * Gets the authorization for a message from a specific address.
	 *
	 * This function first encodes the message into bytes and then converts the bytes into a hexadecimal string.
	 * It then signs the hexadecimal string with the specified address using the API and returns the signed data.
	 * You can use it to request signature to sign a message, authentication, etc.
	 *
	 * @param {string} addr - The address to use for signing.
	 * @param {string} message - The message to sign.
	 * @returns {Promise<string>} A promise that resolves to the signed data.
	 * @throws {Error} Throws an error if unable to sign the data.
	 */
	async getAuthorization(addr: string, message: string) {
		try {
			const messageEncoder = new TextEncoder();
			const messageBytes = messageEncoder.encode(message);
			const messageHex = Array.from(messageBytes, (b) => b.toString(16).padStart(2, '0')).join('');
			const sigData = await this.api.signData(addr, messageHex);
			return sigData;
		} catch (error) {
			console.error('Error signing data:', error);
			throw error;
		}
	}
}

/**
 * A writable store that holds the current wallet instance.
 *
 * This store can hold an instance of `WalletInstance` or `undefined`.
 * You can subscribe to this store to reactively get the current wallet instance, and you can update the store to change the current wallet instance.
 *
 * @type {Writable<WalletInstance | undefined>}
 */
const wallet = writable<WalletInstance | undefined>(undefined);

/**
 * Connects to a wallet passing a wallet name as a parameter.
 *
 * This function first finds the wallet option with the specified name
 * from the list of wallets, you can get the list using the list store
 * If the wallet option is found, it sets the selected wallet to the wallet
 *  option, enables the Cardano wallet with the specified name, and creates
 *  a new wallet instance with the enabled wallet API.
 * It then sets the value of the wallet store to the new wallet instance.
 * Finally, it checks if the Cardano wallet with the specified name is enabled
 *  and sets the connection status accordingly.
 *
 * @param {string} walletName - The name of the wallet to connect to.
 * @throws {Error} Throws an error if unable to connect to the wallet.
 */
export async function connect(walletName: string) {
	const walletOption = get(list).find(([name]) => name === walletName)?.[1];
	if (walletOption) {
		selected.set(walletOption);
		const walletAPI = await enableCardanoWallet(walletName);
		const walletInstance = new WalletInstance(walletAPI);
		wallet.set(walletInstance); // Set the value of the wallet store
		if (
			window.cardano &&
			window.cardano[walletName] &&
			(await window.cardano[walletName].isEnabled())
		) {
			isConnected.set(true);
		} else {
			isConnected.set(false);
		}
	}
}

/**
 * Disconnects from the wallet.
 *
 * This function sets the current wallet instance, the selected wallet, and the connection status to their initial states.
 * After calling this function, the wallet store will hold `undefined`, the selected store will hold `undefined`, and the connection status will be `false`.
 * If you're using cookies to store user data, like the wallet name, you should clear the cookies together with calling this function.
 */
export function disconnect() {
	wallet.set(undefined);
	selected.set(undefined);
	isConnected.set(false);
}

/**
 * Populates the list of wallets on mount.
 *
 * This function calls `getCardanoWallets` to get the Cardano wallets and then sets the value of the `list` store to the wallets.
 */
getCardanoWallets().then((wallets) => {
	list.set(wallets);
});

/**
 * An object that provides access to the Cardano wallet functionality.
 *
 * This object contains the following properties:
 * - `list`: A store that holds the list of wallets.
 * - `connect`: A function that connects to a wallet.
 * - `disconnect`: A function that disconnects from the wallet.
 * - `isConnected`: A store that holds the connection status.
 * - `wallet`: A store that holds the current wallet instance.
 * - `selected`: A store that holds the selected wallet.
 *
 * @type {object}
 */
export const useCardanoWallet = { list, connect, disconnect, isConnected, wallet, selected };

/**
 * Loads the Cardano serialization library and assigns it to the `Cardano` property on the `window` object.
 *
 * This code first checks if the `window` object exists, indicating that it's running in a browser environment.
 * If it does, it imports the Cardano serialization library from `@emurgo/cardano-serialization-lib-browser` and assigns it to the `Cardano` property on the `window` object.
 * If an error occurs while importing the library, it logs the error to the console.
 */
if (typeof window !== 'undefined') {
	(async () => {
		try {
			const Cardano = await import('@emurgo/cardano-serialization-lib-browser');
			// Assign Cardano module to window object
			(window as any).Cardano = Cardano;
		} catch (error) {
			// Handle any errors
			console.error('Error loading cardano_serialization_lib:', error);
		}
	})();
}
