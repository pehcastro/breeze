import type { Writable } from 'svelte/store';
import type { walletAPI, walletOption, Wallet as WalletType } from '../types/'

declare class WalletInstance implements WalletType {
  constructor(api: walletAPI);

  getAssets(): Promise<object>; 
  getAddress(): Promise<string>;
  getAuthorization(addr: string, message: string): Promise<DataSignature>;
  getNetworkId(): Promise<number>;
  getUtxos(amount?: string, paginate?: Paginate): Promise<TransactionUnspentOutput[] | undefined>;
  getBalance(): Promise<string>;
  getUsedAddresses(paginate?: Paginate): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  getChangeAddress(): Promise<string>;
  getRewardAddresses(): Promise<string[]>;
  signTx(tx: string, partialSign?: boolean): Promise<string>;
  signData(address: string, payload: string): Promise<DataSignature>;
  submitTx(tx: string): Promise<string>;
  getCollateral(): Promise<TransactionUnspentOutput[] | undefined>;
  experimental: {
    getCollateral(): Promise<TransactionUnspentOutput[] | undefined>;
    on(eventName: string, callback: (...args: unknown[]) => void): void;
    off(eventName: string, callback: (...args: unknown[]) => void): void;
  };
}

declare const useCardanoWallet: {
  list: Writable<[string, walletOption][]>;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
  isConnected: Writable<boolean>;
  wallet: Writable<WalletInstance | undefined>;
  selected: Writable<walletOption | undefined>;
};

export default useCardanoWallet;