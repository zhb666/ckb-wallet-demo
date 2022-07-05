import { Indexer, CellCollector } from "@ckb-lumos/lumos";
import CKB from "@nervosnetwork/ckb-sdk-core";
import { ajaxGet } from "../service/http";

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
const addr = ckb.utils.privateKeyToAddress(sk, {
  prefix: ckb.utils.AddressPrefix.Testnet,
  type: ckb.utils.AddressType.HashIdx,
  codeHashOrCodeHashIndex: "0x00"
});

console.log(addr, "addr____");

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
    capacity: BigInt(16600000000),
    fee: BigInt(100000)
  });

  console.log(depositTx, "depositTx____");
  return;

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
  txHash: "0x6588051bcff797e8d614b16215fe9d755879adf256af88f6d271fdff28b2df5c",
  index: "0x0"
};

const logDepositEpoch = async () => {
  await ckb.loadDeps();
  const tx = await ckb.rpc.getTransaction(depositOutPoint.txHash);
  console.log(tx, "tx_________________");
  if (tx.txStatus.blockHash) {
    const b = await ckb.rpc.getBlock(tx.txStatus.blockHash);
    console.log(b, "b_____");
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

// 第2笔交易测试118ckb
const depositEpoch = {
  length: "0x708",
  index: "0x510",
  number: "0x1155"
};

const starWithdrawing = async () => {
  await loadCells();
  await ckb.loadDeps();
  const tx = await ckb.generateDaoWithdrawStartTransaction({
    outPoint: depositOutPoint,
    fee: BigInt(10000000)
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

// 第一笔交易测试
const startWithdrawingEpoch = {
  length: "0x708",
  index: "0x5bb",
  number: "0x1155"
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
    fee: BigInt(1000000)
  });
  console.log(tx, "tx_________");
  const signed = ckb.signTransaction(sk)(tx);
  console.log(signed, "signed______");

  const txHash = await ckb.rpc.sendTransaction(signed);
  console.log(txHash, "txHash______");
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

const getTest = async () => {
  const data = await ajaxGet(
    "https://testnet-api.explorer.nervos.org/api/v1/addresses/ckt1qyq9suqw8dlmfe9zfhpeapceypr3mmjax3msymwkae",
    {},
    {}
  );
};

export {
  deposit,
  logDepositEpoch,
  starWithdrawing,
  logStartWithdrawingEpoch,
  logCurrentEpoch,
  withdraw,
  getTest
};
