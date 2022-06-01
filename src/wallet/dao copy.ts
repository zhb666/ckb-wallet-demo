/* eslint-disable */
// const path = require('path')
// const os = require('os')
import { Indexer, CellCollector } from "@ckb-lumos/lumos";
import CKB from "@nervosnetwork/ckb-sdk-core";
// const { Indexer, CellCollector } = require('@ckb-lumos/indexer')

// const CKB_URL = process.env.CKB_URL || 'http://localhost:8114' // example node url
// const LUMOS_DB = path.join(os.tmpdir(), 'lumos_db')

const CKB_RPC_URL = "https://testnet.ckb.dev";

const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";

/**
 * lumos indexer
 */
const indexer = new Indexer(CKB_INDEXER_URL, CKB_RPC_URL);
indexer.startForever();

/**
 * sdk
 */
const ckb = new CKB(CKB_RPC_URL);

const sk = "0x913a1d234419e401db40a8821ac4ba9f4d54f99e977f7857e8768887e4eccd40";
const pk = ckb.utils.privateKeyToPublicKey(sk);

const pkh = `0x${ckb.utils.blake160(pk, "hex")}`;
const addr = ckb.utils.privateKeyToAddress(sk, {});

const loadCells = async () => {
  await ckb.loadDeps();
  if (!ckb.config.secp256k1Dep) return;
  const lock = {
    codeHash: ckb.config.secp256k1Dep.codeHash,
    hashType: ckb.config.secp256k1Dep.hashType,
    args: pkh
  };
  /**
   * load cells from lumos as `examples/sendTransactionWithLumosCollector.js` shows
   */
  await ckb.loadCells({ indexer, CellCollector, lock, save: true });
};

const deposit = async () => {
  await loadCells();
  await ckb.loadDeps();
  const depositTx = ckb.generateDaoDepositTransaction({
    fromAddress: addr,
    capacity: BigInt(10200000000),
    fee: BigInt(100000)
  });
  const signed = ckb.signTransaction(sk)(depositTx);

  const txHash = await ckb.rpc.sendTransaction(signed);
  const depositOutPoint = {
    txHash,
    index: "0x0"
  };
  console.log(`const depositOutPoint = ${JSON.stringify(depositOutPoint)}`);
};

// 第一笔交易测试
const depositOutPoint = {
  txHash: "0x201b4e60ee79934170cadc8e296e9d685c49f2b497e964417d754b88e051e2b1",
  index: "0x0"
};

const logDepositEpoch = async () => {
  await ckb.loadDeps();
  const tx = await ckb.rpc.getTransaction(depositOutPoint.txHash);
  if (tx.txStatus.blockHash) {
    const b = await ckb.rpc.getBlock(tx.txStatus.blockHash);
    const epoch = b.header.epoch;
    console.log(
      `const depositEpoch = ${JSON.stringify(
        ckb.utils.parseEpoch(epoch),
        null,
        2
      )}`
    );
  } else {
    console.log("not committed");
  }
};

const depositEpoch = {
  length: "0x708",
  index: "0x54f",
  number: "0x114b"
};

const starWithdrawing = async () => {
  await loadCells();
  await ckb.loadDeps();
  const tx = await ckb.generateDaoWithdrawStartTransaction({
    outPoint: depositOutPoint,
    fee: BigInt(100000000)
  });
  const signed = ckb.signTransaction(sk)(tx);
  const txHash = await ckb.rpc.sendTransaction(signed);
  const outPoint = {
    txHash,
    index: "0x0"
  };
  console.log(
    `const startWithDrawOutPoint = ${JSON.stringify(outPoint, null, 2)}`
  );
};

const startWithDrawOutPoint = {
  txHash: "0xd5271ca8302f155bdcc69e60e967aa9eb709eb8f559f46a8b79613955626bbcf",
  index: "0x0"
};

const logStartWithdrawingEpoch = async () => {
  await ckb.loadDeps();
  const tx = await ckb.rpc.getTransaction(startWithDrawOutPoint.txHash);
  if (tx.txStatus.blockHash) {
    const b = await ckb.rpc.getBlock(tx.txStatus.blockHash);
    const epoch = b.header.epoch;
    console.log(
      `const startWithdrawingEpoch = ${JSON.stringify(
        ckb.utils.parseEpoch(epoch),
        null,
        2
      )}`
    );
  } else {
    console.log("not committed");
  }
};

const startWithdrawingEpoch = {
  length: "0x708",
  index: "0x546",
  number: "0x114f"
};

const logCurrentEpoch = async () => {
  ckb.rpc.getTipHeader().then(h => console.log(ckb.utils.parseEpoch(h.epoch)));
};

const withdraw = async () => {
  await ckb.loadDeps();
  await loadCells();
  const tx = await ckb.generateDaoWithdrawTransaction({
    depositOutPoint,
    withdrawOutPoint: startWithDrawOutPoint,
    fee: BigInt(100000)
  });
  const signed = ckb.signTransaction(sk)(tx);
  const txHash = await ckb.rpc.sendTransaction(signed);
  const outPoint = {
    txHash,
    index: "0x0"
  };
  console.log(`const withdrawOutPoint = ${JSON.stringify(outPoint, null, 2)}`);
};

const withDrawOutPoint = {
  txHash: "0xb1ee185a4e811247b1705a52df487c3ce839bfa2f72e4c7a74b6fc6b0ea4cfa7",
  index: "0x0"
};

export {
  deposit,
  logDepositEpoch,
  starWithdrawing,
  logStartWithdrawingEpoch,
  logCurrentEpoch,
  withdraw
};

// deposit()
// logDepositEpoch()
// starWithdrawing()
// logStartWithdrawingEpoch()
// logCurrentEpoch()
// withdraw()

// setInterval(logCurrentEpoch, 1000)
