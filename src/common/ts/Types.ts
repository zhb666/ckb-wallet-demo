enum ChainTypes {
  mainnet,
  testnet
}

type ChainTypeString = "mainnet" | "testnet";

export type NotificationType = "success" | "info" | "warning" | "error";

export { ChainTypes };
export type { ChainTypeString };
