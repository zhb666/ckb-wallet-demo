import { Indexer, CellCollector, config, helpers, hd } from "@ckb-lumos/lumos";
import CKB from "@nervosnetwork/ckb-sdk-core";
import { get_transaction, send_transaction, get_cells } from "../rpc";

const CKB_RPC_URL = "http://localhost:9000";
const CKB_INDEXER_URL = "http://localhost:9000/indexer";

// According to this, switch the main network and test network
export const { AGGRON4, LINA } = config.predefined;

const RPC_NETWORK = AGGRON4;

// const CKB_RPC_URL = "https://testnet.ckb.dev";
// const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";

/**
 * lumos indexer
 */
const indexer = new Indexer(CKB_INDEXER_URL, CKB_RPC_URL);
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
  console.log(depositTx, "depositTx_____");

  const signed = ckb.signTransaction(options.privKey)(depositTx);

  const txHash = await ckb.rpc.sendTransaction(signed);
  const depositOutPoint = {
    txHash,
    index: "0x0"
  };
  console.log(`const depositOutPoint = ${JSON.stringify(depositOutPoint)}`);

  return txHash;
};

// // 第一笔交易测试
// const depositOutPoint = {
//   txHash: "0xa2692a00465d619b00660f4907be5bd1175593c85b486b6e56f5c983884e11a1",
//   index: "0x0"
// };

// const logDepositEpoch = async () => {
//   // await ckb.loadDeps();
//   const cells = await loadCells();
//   console.log(cells);
//   const tx = await ckb.rpc.getTransaction(depositOutPoint.txHash);

//   // const tx = await get_transaction(depositOutPoint.txHash);

//   console.log(tx, "tx_________________");
//   if (tx.txStatus.blockHash) {
//     const b = await ckb.rpc.getBlock(tx.txStatus.blockHash);
//     console.log(b, "b_____");
//     const epoch = b.header.epoch;
//     console.log(
//       `const depositEpoch = ${JSON.stringify(
//         ckb.utils.parseEpoch(epoch),
//         null,
//         2
//       )}`
//     );
//   } else {
//     console.log("not committed");
//   }
// };

// // 第2笔交易测试118ckb
// const depositEpoch = {
//   length: "0x708",
//   index: "0x510",
//   number: "0x1155"
// };

// const starWithdrawing = async () => {
//   const cells = await loadCells();
//   const tx = await ckb.generateDaoWithdrawStartTransaction({
//     outPoint: depositOutPoint,
//     fee: BigInt(10000000)
//   });

//   console.log(tx, "tx___");

//   const signed = ckb.signTransaction(sk)(tx);
//   console.log(`const signed = ${JSON.stringify(signed, null, 2)}`);

//   // return;

//   // const txHash = await send_transaction(signed);

//   const txHash = await ckb.rpc.sendTransaction(signed);
//   const outPoint = {
//     txHash,
//     index: "0x0"
//   };
//   console.log(
//     `const startWithDrawOutPoint = ${JSON.stringify(outPoint, null, 2)}`
//   );
// };

// const startWithDrawOutPoint = {
//   txHash: "0xd5271ca8302f155bdcc69e60e967aa9eb709eb8f559f46a8b79613955626bbcf",
//   index: "0x0"
// };

// const logStartWithdrawingEpoch = async () => {
//   await ckb.loadDeps();
//   const tx = await ckb.rpc.getTransaction(startWithDrawOutPoint.txHash);
//   if (tx.txStatus.blockHash) {
//     const b = await ckb.rpc.getBlock(tx.txStatus.blockHash);
//     const epoch = b.header.epoch;
//     console.log(
//       `const startWithdrawingEpoch = ${JSON.stringify(
//         ckb.utils.parseEpoch(epoch),
//         null,
//         2
//       )}`
//     );
//   } else {
//     console.log("not committed");
//   }
// };

// // 第一笔交易测试
// const startWithdrawingEpoch = {
//   length: "0x708",
//   index: "0x5bb",
//   number: "0x1155"
// };

// const logCurrentEpoch = async () => {
//   ckb.rpc.getTipHeader().then(h => console.log(ckb.utils.parseEpoch(h.epoch)));
// };

// const withdraw = async () => {
//   await ckb.loadDeps();
//   await loadCells();
//   const tx = await ckb.generateDaoWithdrawTransaction({
//     depositOutPoint,
//     withdrawOutPoint: startWithDrawOutPoint,
//     fee: BigInt(1000000)
//   });
//   console.log(tx, "tx_________");
//   const signed = ckb.signTransaction(sk)(tx);
//   console.log(signed, "signed______");

//   const txHash = await ckb.rpc.sendTransaction(signed);
//   console.log(txHash, "txHash______");
//   const outPoint = {
//     txHash,
//     index: "0x0"
//   };
//   console.log(`const withdrawOutPoint = ${JSON.stringify(outPoint, null, 2)}`);
// };

// const withDrawOutPoint = {
//   txHash: "0xb1ee185a4e811247b1705a52df487c3ce839bfa2f72e4c7a74b6fc6b0ea4cfa7",
//   index: "0x0"
// };

export {
  deposit
  // logDepositEpoch,
  // starWithdrawing,
  // logStartWithdrawingEpoch,
  // logCurrentEpoch,
  // withdraw
};
