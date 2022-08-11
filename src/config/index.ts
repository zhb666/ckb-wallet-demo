import { Indexer } from "@ckb-lumos/ckb-indexer";
interface BrowserUrl {
  test: string;
  mian: string;
}

export const browserUrl: BrowserUrl = {
  test: "https://pudge.explorer.nervos.org",
  mian: "https://explorer.nervos.org"
};

export const CKB_RPC_URL = "http://localhost:9000";
export const CKB_INDEXER_URL = "http://localhost:9000";
export const indexer = new Indexer(CKB_INDEXER_URL, CKB_RPC_URL);

export const TEST_CKB_RPC_URL = "https://testnet.ckb.dev/rpc";
export const TEST_CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";
export const test_indexer = new Indexer(TEST_CKB_INDEXER_URL, TEST_CKB_RPC_URL);
