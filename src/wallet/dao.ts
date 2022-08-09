import { Indexer, CellCollector, config, helpers, hd } from "@ckb-lumos/lumos";
import CKB from "@nervosnetwork/ckb-sdk-core";
import { CKB_RPC_URL, indexer } from "../config";
import { get_transaction, send_transaction, get_cells } from "../rpc";

// According to this, switch the main network and test network
export const { AGGRON4, LINA } = config.predefined;

const RPC_NETWORK = AGGRON4;

/**
 * lumos indexer
 */
indexer.startForever();

/**
 * sdk
 */
const ckb = new CKB(CKB_RPC_URL);

const loadCells = async (privKey: string) => {
  const pk = ckb.utils.privateKeyToPublicKey(privKey);

  const pkh = `0x${ckb.utils.blake160(pk, "hex")}`;

  const template = RPC_NETWORK.SCRIPTS["SECP256K1_BLAKE160"]!;
  const lockScript = {
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: pkh
  };

  // get address
  const addr = helpers.encodeToAddress(lockScript, { config: RPC_NETWORK });

  console.log(addr, "addr_____s");

  // const loadDeps = await ckb.loadDeps();
  const loadDeps = {
    daoDep: {
      hashType: "type",
      codeHash:
        "0x32064a14ce10d95d4b7343054cc19d73b25b16ae61a6c681011ca781a60c7923",
      typeHash:
        "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
      outPoint: {
        txHash:
          "0x8f8c79eb6671709633fe6a46de93c0fedc9c1b8a6527a18d3983879542635c9f",
        index: "0x2"
      },
      depType: "code"
    },
    secp256k1Dep: {
      hashType: "type",
      codeHash:
        "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
      outPoint: {
        txHash:
          "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
        index: "0x0"
      },
      depType: "depGroup"
    }
  };

  // @ts-ignore
  ckb.config = loadDeps;

  console.log(loadDeps, "loadDeps----");

  // if (!ckb.config.secp256k1Dep) return;
  const lock = {
    codeHash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    hashType: "type",
    args: pkh
  };
  /**
   * load cells from lumos as `examples/sendTransactionWithLumosCollector.js` shows
   */
  const loadCells = await ckb.loadCells({
    indexer,
    CellCollector,
    // @ts-ignore
    lock,
    save: true
  });

  // const getcells = await get_cells();

  // console.log(getcells.objects, "getcells____");
  console.log(loadCells, "loadCells______");
  // return loadCells;
  return loadCells;
};

interface Options {
  from: string;
  amount: number;
  privKey: string;
}

const deposit = async (options: Options) => {
  const cells = await loadCells(options.privKey);
  console.log(cells);

  const depositTx = ckb.generateDaoDepositTransaction({
    fromAddress: options.from,
    capacity: BigInt(options.amount),
    fee: BigInt(100000)
    // cells
  });

  const signed = ckb.signTransaction(options.privKey)(depositTx);

  const txHash = await ckb.rpc.sendTransaction(signed);
  const depositOutPoint = {
    txHash,
    index: "0x0"
  };
  console.log(`const depositOutPoint = ${JSON.stringify(depositOutPoint)}`);

  return txHash;
};

const ckbUnlock = async (
  depositHash: string,
  withdrawHash: string,
  privateKeys: string
) => {
  const depositOutPoint = {
    txHash: depositHash,
    index: "0x0"
  };

  const startWithDrawOutPoint = {
    txHash: withdrawHash,
    index: "0x0"
  };

  await ckb.loadDeps();
  await loadCells(privateKeys);
  const tx = await ckb.generateDaoWithdrawTransaction({
    depositOutPoint,
    withdrawOutPoint: startWithDrawOutPoint,
    fee: BigInt(1000000)
  });
  console.log(tx);
};

export { deposit, ckbUnlock };
