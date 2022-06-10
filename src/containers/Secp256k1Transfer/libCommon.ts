import {
  Indexer,
  helpers,
  Address,
  Script,
  RPC,
  hd,
  config,
  Cell,
  commons,
  core,
  WitnessArgs,
  toolkit,
  BI,
  CellCollector
} from "@ckb-lumos/lumos";
import { common } from "@ckb-lumos/common-scripts";

import CKB from "@nervosnetwork/ckb-sdk-core";

import { values } from "@ckb-lumos/base";
const { ScriptValue } = values;

export const CONFIG = config.createConfig({
  PREFIX: "ckt",
  SCRIPTS: {
    ...config.predefined.AGGRON4.SCRIPTS
    // // https://github.com/lay2dev/pw-core/blob/861310b3dd8638f668db1a08d4c627db4c34d815/src/constants.ts#L156-L169
    // PW_LOCK: {
    //   CODE_HASH:
    //     "0x58c5f491aba6d61678b7cf7edf4910b1f5e00ec0cde2f42e0abb4fd9aff25a63",
    //   HASH_TYPE: "type",
    //   TX_HASH:
    //     "0x57a62003daeab9d54aa29b944fc3b451213a5ebdf2e232216a3cfed0dde61b38",
    //   INDEX: "0x0",
    //   DEP_TYPE: "code"
    // }
  }
});

config.initializeConfig(CONFIG);

// According to this, switch the main network and test network
export const { AGGRON4, LINA } = config.predefined;
console.log(AGGRON4, "AGGRON4____");
console.log(LINA, "LINA");

const RPC_NETWORK = AGGRON4;

//  https://mainnet.ckb.dev
//  https://testnet.ckb.dev

const CKB_RPC_URL = "https://testnet.ckb.dev/rpc";

const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";

// const CKB_RPC_URL = "http://localhost:9000";

// const CKB_INDEXER_URL = "http://localhost:9000";

const rpc = new RPC(CKB_RPC_URL);
const indexer = new Indexer(CKB_INDEXER_URL, CKB_RPC_URL);

type Account = {
  lockScript: Script;
  address: Address;
  pubKey: string;
};
export const generateAccountFromPrivateKey = (privKey: string): Account => {
  // Convert to public key
  const pubKey = hd.key.privateToPublic(privKey);
  console.log(pubKey, "pubKey___");
  const args = hd.key.publicKeyToBlake160(pubKey);
  console.log(args, "args___");

  const template = RPC_NETWORK.SCRIPTS["SECP256K1_BLAKE160"]!;
  console.log(template, "template_____");
  const lockScript = {
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: args
  };
  // get address
  const address = helpers.generateAddress(lockScript, { config: RPC_NETWORK });
  console.log(address, "address____");
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

  console.log(collector, "collector___");

  // Convert to bi object
  let balance = BI.from(0);
  console.log(balance, "balance___");

  // Get balance
  for await (const cell of collector.collect()) {
    // balance++
    balance = balance.add(cell.cell_output.capacity);
    console.log(cell.cell_output.capacity, "cell.cell_output.capacity_____");
  }

  // sum
  return balance;
}

// start

const tipHeader = {
  compact_target: "0x20010000",
  dao: "0x49bfb20771031d556c8480d47f2a290059f0ac7e383b6509006f4a772ed50200",
  epoch: "0xa0006002b18",
  hash: "0x432451e23c26f45eaceeedcc261764d6485ea5c9a204ac55ad755bb8dec9a079",
  nonce: "0x8199548f8a5ac7a0f0caef1620f37b79",
  number: "0x1aef6",
  parent_hash:
    "0x63594a64108f19f6aed53d0dca9ab4075aac4379cb80b2097b0deac8fc16fd3b",
  proposals_hash:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  timestamp: "0x172f6b9a4cf",
  transactions_root:
    "0x282dbadcd49f3e229d997875f37f4e4f19cb4f04fcf762e9639145aaa667b6f8",
  uncles_hash:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  version: "0x0"
};

const fromInfos = [
  // "ckb1qyq9suqw8dlmfe9zfhpeapceypr3mmjax3mse7sf39",
  "ckt1qyq9suqw8dlmfe9zfhpeapceypr3mmjax3msymwkae",
  {
    R: 0,
    M: 1,
    publicKeyHashes: ["0x58700e3b7fb4e4a24dc39e871920471dee5d3477"]
  }
];

interface Options {
  from: string;
  to: string;
  amount: string;
  privKey: string;
}

// amount, from: fromAddr, to: toAddr, privKey
export async function transfer(options: Options): Promise<string> {
  console.log(config.getConfig(), "config.getConfig();__-");
  config.getConfig();
  let txSkeleton = helpers.TransactionSkeleton({ cellProvider: indexer });

  console.log(txSkeleton);

  txSkeleton = await common.transfer(
    txSkeleton,
    fromInfos,
    "ckt1qyqw8c9g9vvemn4dk40zy0rwfw89z82h6fys07ens3",
    // "ckb1qyqw8c9g9vvemn4dk40zy0rwfw89z82h6fysjm8vud",
    BigInt(10000000000)
    // @ts-ignore
    // tipHeader
  );
  console.log(txSkeleton, "txSkeleton______1");

  txSkeleton = await common.prepareSigningEntries(txSkeleton);

  console.log(txSkeleton, "txSkeleton______2");

  console.log(txSkeleton.get("signingEntries").get(0)?.message, "message___");

  const message = txSkeleton.get("signingEntries").get(0)?.message;
  const Sig = hd.key.signRecoverable(
    message!,
    "0x913a1d234419e401db40a8821ac4ba9f4d54f99e977f7857e8768887e4eccd40"
  );
  console.log(Sig, "Sig_____");

  const tx = helpers.sealTransaction(txSkeleton, [Sig]);

  console.log(tx, "tx_______");

  const hash = await rpc.send_transaction(tx, "passthrough");

  console.log("The transaction hash is", hash);

  return "";
}
