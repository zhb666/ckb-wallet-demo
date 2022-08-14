import { Indexer } from "@ckb-lumos/ckb-indexer";
import { config } from "@ckb-lumos/lumos";
interface BrowserUrl {
  test: string;
  mian: string;
}

const browserUrl: BrowserUrl = {
  test: "https://pudge.explorer.nervos.org",
  mian: "https://explorer.nervos.org"
};

const CKB_RPC_URL = "http://localhost:9000";
const CKB_INDEXER_URL = "http://localhost:9000";
const INDEXER = new Indexer(CKB_INDEXER_URL, CKB_RPC_URL);

const TEST_CKB_RPC_URL = "https://testnet.ckb.dev/rpc";
const TEST_CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";
const TEST_INDEXER = new Indexer(TEST_CKB_INDEXER_URL, TEST_CKB_RPC_URL);

// AGGRON4 for test, LINA for main
const { AGGRON4, LINA } = config.predefined;
const RPC_NETWORK = AGGRON4;

const DAOCELLSIZE = BigInt(102 * 10 ** 8);
const TRANSFERCELLSIZE = BigInt(61 * 10 ** 8);
const DEPOSITDAODATA = "0x0000000000000000";

export {
  browserUrl,
  CKB_RPC_URL,
  CKB_INDEXER_URL,
  INDEXER,
  TEST_CKB_RPC_URL,
  TEST_CKB_INDEXER_URL,
  TEST_INDEXER,
  AGGRON4,
  LINA,
  RPC_NETWORK,
  DAOCELLSIZE,
  DEPOSITDAODATA,
  TRANSFERCELLSIZE
};
