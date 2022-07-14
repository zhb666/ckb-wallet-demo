import {
  Indexer,
  helpers,
  Address,
  Script,
  RPC,
  hd,
  config,
  BI,
  CellCollector
} from "@ckb-lumos/lumos";
import CKB from "@nervosnetwork/ckb-sdk-core";

import { values } from "@ckb-lumos/base";
const { ScriptValue } = values;

// According to this, switch the main network and test network
export const { AGGRON4, LINA } = config.predefined;

const RPC_NETWORK = AGGRON4;

//  https://mainnet.ckb.dev
//  https://testnet.ckb.dev
// http://localhost:9000

const CKB_RPC_URL = "http://localhost:9000/rpc";
const CKB_INDEXER_URL = "http://localhost:9000/indexer";
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

  // Get balance
  for await (const cell of collector.collect()) {
    // balance++
    balance = balance.add(cell.cell_output.capacity);
  }

  // sum
  return balance;
}

interface Options {
  from: string;
  to: string;
  amount: number;
  privKey: string;
}

// amount, from: fromAddr, to: toAddr, privKey
export const transfer = async (options: Options) => {
  const privateKey = options.privKey; // example private key

  // const ckb = new CKB("https://testnet.ckb.dev");
  // const ckb = new CKB("http://localhost:8114");
  const ckb = new CKB("http://localhost:9000");

  // await ckb.loadDeps();

  const publicKey = await ckb.utils.privateKeyToPublicKey(privateKey);
  /**
   * to see the public key
   */
  // console.log(`Public key: ${publicKey}`)

  const publicKeyHash = `0x${ckb.utils.blake160(publicKey, "hex")}`;
  /**
   * to see the public key hash
   */
  console.log(`Public key hash: ${publicKeyHash}`);

  const lock = {
    codeHash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    hashType: "type",
    args: publicKeyHash
  };
  console.log(ckb.config.secp256k1Dep, "ckb.config.secp256k1Dep");

  const deps = {
    hashType: "type",
    codeHash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    outPoint: {
      txHash:
        "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
      index: "0x0"
    },
    depType: "depGroup"
  };

  /**
   * load cells from lumos as `examples/sendTransactionWithLumosCollector.js` shows
   */
  console.log(CellCollector, "CellCollector");
  // @ts-ignore
  const unspentCells = await ckb.loadCells({ indexer, CellCollector, lock });

  /**
   * to see the unspent cells
   */
  console.log(unspentCells, "unspentCells____");

  const rawTransaction = await ckb.generateRawTransaction({
    fromAddress: options.from,
    toAddress: options.to,
    capacity: BigInt(options.amount),
    fee: BigInt(100000),
    safeMode: true,
    cells: unspentCells,
    // @ts-ignore
    deps: deps
  });

  console.log(rawTransaction, "rawTransaction____");

  const signedTx = ckb.signTransaction(privateKey)(rawTransaction);
  /**
   * to see the signed transaction
   */
  console.log(JSON.stringify(signedTx, null, 2));

  const realTxHash = await ckb.rpc.sendTransaction(signedTx);

  /**
   * to see the real transaction hash
   */
  console.log(`The real transaction hash is: ${realTxHash}`);

  return realTxHash;

  // if (realTxHash) return true;
};
