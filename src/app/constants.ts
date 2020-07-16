interface Net {
  NAME: string;
  NETWORK: string;
  CSI: { // Conseil Server Info
    url: string;
    apiKey: string;
  };
  NODE_URL: string;
  BLOCK_EXPLORER_URL: string;
  ASSETS: Assets;
}
type Assets = Record<string, AssetData>;
interface AssetData {
  name: string;
  class: string;
  bigMapId: number;
  assetCategory: string;
  description: string;
  imageUri: string;
  assetMapUri: string;
}
export class Constants {
  // Select Testnet or Mainnet
  readonly NET: Net = this.carthagenet();

  private mainnet(): Net {
    return {
      NAME: 'Mainnet',
      NETWORK: 'mainnet',
      CSI: {
        url: 'https://conseil-prod.cryptonomic-infra.tech',
        apiKey: 'klassare'
      },
      NODE_URL: 'https://mainnet-tezos.giganode.io',
      BLOCK_EXPLORER_URL: 'https://tzkt.io',
      ASSETS: {}
    };
  }
  private carthagenet(): Net {
    return {
      NAME: 'Testnet / Carthage',
      NETWORK: 'carthagenet',
      CSI: {
        url: 'https://conseil-dev.cryptonomic-infra.tech',
        apiKey: 'klassare'
      },
      NODE_URL: 'https://testnet-tezos.giganode.io',
      BLOCK_EXPLORER_URL: 'https://carthage.tzkt.io',
      ASSETS: {
        "KT1TjdF4H8H2qzxichtEbiCwHxCRM1SVx6B7" : {
          name: "tzBTC",
          class: "FA1.2",
          bigMapId: 1035,
          assetCategory: "finance",
          description: "tzBtc delivers the power of Bitcoin as a token on the Tezos blockchain.",
          imageUri: "https://x-tz.com/testtokens/finance/tzbtc/tzbtc_logo_single.png",
          assetMapUri: ""
        },
        "KT1N3YaxhH3JGr3u9Q7ULd6MnMxYo24jKKDF" : {
          name: "StakerDAO",
          class: "FA1.2",
          bigMapId: 959,
          assetCategory: "finance",
          description: "StakerDAO is a platform for governing financial assets in a decentralized, secure, and compliant manner.",
          imageUri: "https://x-tz.com/testtokens/finance/stkr/stkr-logo.png",
          assetMapUri: ""
        },
        "KT1HzQofKBxzfiKoMzGbkxBgjis2mWnCtbC2" : {
          name: "USDtz",
          class: "FA1.2",
          bigMapId: 498,
          assetCategory: "finance",
          description: "USD Tez (Symbol USDtz ) is a Tezos on-chain stablecoin pegged to the value of the United States Dollar.",
          imageUri: "https://x-tz.com/testtokens/finance/usdtz/usdtz.png",
          assetMapUri: "https://x-tz.com/testtokens/finance/usdtz/usdtz.json"
        },
        "KT1QQ5fywY6VCxjL3PCjMhL3PvXZWSqFN3EW" : {
          name: "EuroTz",
          class: "FA1.2",
          bigMapId: 1249,
          assetCategory: "finance",
          description: "EuroTz project description goes here, it's a great new blockchain finance solution.",
          imageUri: "https://x-tz.com/testtokens/finance/eurotz/eurotz.png",
          assetMapUri: ""
        },
        "KT1VAkwDFNSUWrjic97ivkMzauU7cpb99H74" : {
          name: "tzBadger",
          class: "FA2",
          bigMapId: 2968,
          assetCategory: "rewards",
          description: "Tezos NFT Badges and points for ecosystem participation (using FA2 multi asset contract with both fungible and NFT token types).",
          imageUri: "https://x-tz.com/testnft/badges/badger/badger-cute.png",
          assetMapUri: "https://api.carthagenet.tzstats.com/explorer/bigmap/2970/values"
        }
      }
    };
  }
}
