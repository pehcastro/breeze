import type { walletAPI, walletOption } from "../types/walletAPI.js";

export async function enableCardanoWallet(walletName: string): Promise<walletAPI | undefined> {
  let walletAPI: walletAPI | undefined;

  if (window.cardano && window.cardano[walletName]) {
    const wallet: walletOption = window.cardano?.[walletName]
    walletAPI = await wallet?.enable();
  }

  return walletAPI;
}