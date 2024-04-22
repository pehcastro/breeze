type APIError = any; // Replace with actual type
type Paginate = any; // Replace with actual type
type transactionUnspentOutput = any; // Replace with actual type

type dataSignature = {
  signature: string;
  key: string;
};

interface walletAPI {
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

interface Wallet extends walletAPI {
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

interface walletOption {
    name: string;
    icon: string;
    apiVersion: string;
    enable(): Promise<walletAPI>;
    isEnabled(): Promise<boolean>;
  }

type Cardano = {
  [key: string]: walletOption;
};

declare global {
  interface Window {
    cardano?: Cardano;
  }
}

export { Cardano, walletAPI, walletOption, Wallet };