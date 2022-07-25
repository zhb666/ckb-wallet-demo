import {
  Indexer,
  helpers,
  Address,
  Script,
  hd,
  config,
  BI
} from "@ckb-lumos/lumos";

// According to this, switch the main network and test network
export const { AGGRON4, LINA } = config.predefined;

const RPC_NETWORK = AGGRON4;

//  https://mainnet.ckb.dev
//  https://testnet.ckb.dev
// http://localhost:9000

const CKB_RPC_URL = "http://localhost:9000/rpc";
const CKB_INDEXER_URL = "http://localhost:9000/indexer";
const indexer = new Indexer(CKB_INDEXER_URL, CKB_RPC_URL);

type Account = {
  lockScript: Script;
  address: Address;
  pubKey: string;
};
export const generateAccountFromPrivateKey = (privKey: string): Account => {
  // Convert to public key
  const pubKey = hd.key.privateToPublic(privKey);
  const args = hd.key.publicKeyToBlake160(pubKey);

  const template = RPC_NETWORK.SCRIPTS["SECP256K1_BLAKE160"]!;
  const lockScript = {
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: args
  };
  // get address
  const address = helpers.encodeToAddress(lockScript, { config: RPC_NETWORK });
  return {
    lockScript,
    address,
    pubKey
  };
};

export async function capacityOf(address: string): Promise<BI> {
  // You need to check the RPC corresponding to the balance and transfer it to the corresponding aggron4 Lina
  const collector = indexer.collector({
    lock: helpers.parseAddress(address, { config: RPC_NETWORK })
  });

  // Convert to bi object
  let balance = BI.from(0);

  for await (const cell of collector.collect()) {
    balance = balance.add(cell.cell_output.capacity);
  }

  return balance;
}
