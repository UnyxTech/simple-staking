import { WalletProvider } from "./wallet/wallet_provider";

export {};

declare global {
  interface Window {
    btcwallet: WalletProvider;
    btc: any;
    keplr: any;
    okxwallet: any;
    tomo_btc: any;
    $onekey: any;
    bitkeep: any;
  }
}
