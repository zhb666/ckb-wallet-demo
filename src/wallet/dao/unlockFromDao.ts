import { Cell, Script } from "@ckb-lumos/base";
import { since, config, helpers, HexString, Indexer } from "@ckb-lumos/lumos";
import { dao, common } from "@ckb-lumos/common-scripts";
import { values } from "@ckb-lumos/base";
import { ckbUnlock } from "../dao";
import {
  TransactionSkeleton,
  TransactionSkeletonType
} from "@ckb-lumos/helpers";

import {
  filterDAOCells,
  isCellDeposit,
  getCurrentBlockHeader,
  getDepositDaoEarliestSince,
  getWithdrawDaoEarliestSince,
  findCorrectInputFromWithdrawCell,
  getTransactionFromHash,
  getBlockHeaderFromHash,
  depositDaoData,
  signTransaction
} from "./index";
import { DAOUnlockableAmount, FeeRate } from "../../type";
import { get_cells, get_transaction } from "../../rpc";
import { indexer } from "../../config/index";

// AGGRON4 for test, LINA for main
const { AGGRON4, LINA } = config.predefined;
const { ScriptValue } = values;
const NETWORK = AGGRON4;

export enum AddressScriptType {
  SECP256K1_BLAKE160 = "SECP256K1_BLAKE160",
  SUDT = "SUDT",
  DAO = "DAO"
}

const firstRIndexWithoutTxs = 0;

export async function withdrawOrUnlock(
  unlockableAmount: DAOUnlockableAmount,
  address: string,
  privKey: string,
  script: Script,
  feeRate: FeeRate = FeeRate.NORMAL
): Promise<string> {
  // await this.synchronize();

  const res = await get_cells(script);
  const cells = await filterDAOCells(res.objects);

  const cell = await findCellFromUnlockableAmountAndCells(
    unlockableAmount,
    cells
  );

  if (!cell) {
    throw new Error("Cell related to unlockable amount not found!");
  }

  return withdrawOrUnlockFromCell(cell, address, privKey, feeRate);
}

async function findCellFromUnlockableAmountAndCells(
  unlockableAmount: DAOUnlockableAmount,
  cells: Cell[]
): Promise<Cell> {
  const filtCells = await filterDAOCells(cells);
  const capacity = `0x${unlockableAmount.amount.toString(16)}`;

  for (let i = 0; i < filtCells.length; i += 1) {
    // @ts-ignore
    if (
      filtCells[i].cell_output.capacity === capacity &&
      // @ts-ignore
      filtCells[i].out_point.tx_hash === unlockableAmount.txHash
    ) {
      return filtCells[i];
    }
  }

  // @ts-ignore
  return null;
}

async function withdrawOrUnlockFromCell(
  cell: Cell,
  address: string,
  privKey: string,
  feeRate: FeeRate = FeeRate.NORMAL
): Promise<string> {
  console.log("tamade 0000");

  // const { address, privateKey } = this.getAddressAndPrivKeyFromLock(mnemo, cell.cell_output.lock);

  const feeAddresses = [address];
  const privateKeys = [privKey];

  // TODO 地址应该可以写自己的
  const to = feeAddresses[0];

  if (!isCellDeposit(cell)) {
    console.log("Unlocking withdraw cell");

    // Check real unlockability
    if (!(await isCellUnlockable(cell))) {
      throw new Error("Cell can not yet be unlocked.");
    }
    return unlock(
      cell,
      privKey,
      address,
      to,
      feeAddresses,
      privateKeys,
      feeRate
    );
  }

  return withdraw(cell, privKey, feeAddresses, privateKeys, feeRate);
}

async function isCellUnlockable(cell: Cell): Promise<boolean> {
  let sinceBI: bigint;
  const currentBlockHeader = await getCurrentBlockHeader();
  const currentEpoch = since.parseEpoch(currentBlockHeader.epoch);

  if (isCellDeposit(cell)) {
    sinceBI = await getDepositDaoEarliestSince(cell);
  } else {
    sinceBI = await getWithdrawDaoEarliestSince(cell);
  }
  const earliestSince = since.parseAbsoluteEpochSince(sinceBI.toString());

  const unlockable =
    currentEpoch.number > earliestSince.number ||
    (currentEpoch.number === earliestSince.number &&
      currentEpoch.index >= earliestSince.index);
  return unlockable;
}

async function withdraw(
  inputCell: Cell,
  privateKey: string,
  feeAddresses: string[],
  privateKeys: string[],
  feeRate: FeeRate = FeeRate.NORMAL
): Promise<string> {
  let txSkeleton = TransactionSkeleton({ cellProvider: indexer });

  console.log(txSkeleton, "这里会走吗1");

  txSkeleton = await dao.withdraw(
    txSkeleton,
    inputCell,
    // @ts-ignore
    null,
    { config: NETWORK }
  );
  console.log(txSkeleton, feeAddresses, feeRate, undefined, {
    config: NETWORK
  });

  txSkeleton = await common.payFeeByFeeRate(
    txSkeleton,
    feeAddresses,
    feeRate,
    // @ts-ignore
    null,
    { config: NETWORK }
  );

  const signingPrivKeys = extractPrivateKeys(
    txSkeleton,
    feeAddresses,
    privateKeys
  );
  const sortedSignPKeys = [
    privateKey,
    ...signingPrivKeys.filter(pkey => pkey !== privateKey)
  ];

  return signTransaction(txSkeleton, sortedSignPKeys);
}

async function unlock(
  withdrawCell: Cell,
  privateKey: string,
  from: string,
  to: string,
  feeAddresses: string[],
  privateKeys: string[],
  feeRate: FeeRate = FeeRate.NORMAL
): Promise<string> {
  const CKB_RPC_URL = "https://testnet.ckb.dev/rpc";
  const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";
  const indexer = new Indexer(CKB_INDEXER_URL, CKB_RPC_URL);

  let txSkeleton = TransactionSkeleton({ cellProvider: indexer });

  const depositCell = await getDepositCellFromWithdrawCell(withdrawCell);

  // ckbUnlock(
  //   depositCell.out_point?.tx_hash as string,
  //   withdrawCell.out_point?.tx_hash as string,
  //   privateKeys[0]
  // );

  // return "";

  console.log(depositCell);
  console.log(withdrawCell);
  console.log(txSkeleton, to, from);

  if (!(await isCellUnlockable(withdrawCell))) {
    throw new Error("Cell can not be unlocked. Minimum time is 30 days.");
  }

  txSkeleton = await dao.unlock(
    txSkeleton,
    depositCell,
    withdrawCell,
    to,
    from,
    {
      config: NETWORK
      // RpcClient: RpcMocker as any
    }
  );

  console.log(txSkeleton, "111___-");

  txSkeleton = await common.payFeeByFeeRate(
    txSkeleton,
    feeAddresses,
    feeRate,
    // @ts-ignore
    null,
    { config: NETWORK }
  );
  const signingPrivKeys = extractPrivateKeys(
    txSkeleton,
    feeAddresses,
    privateKeys
  );
  const sortedSignPKeys = [
    privateKey,
    ...signingPrivKeys.filter(pkey => pkey !== privateKey)
  ];

  return signTransaction(txSkeleton, sortedSignPKeys);
}

async function getDepositCellFromWithdrawCell(
  withdrawCell: Cell
): Promise<Cell> {
  const { index, txHash } = await findCorrectInputFromWithdrawCell(
    withdrawCell
  );
  const depositTransaction = await getTransactionFromHash(txHash);

  const depositBlockHeader = await getBlockHeaderFromHash(
    depositTransaction.header.hash
  );

  return {
    cell_output: {
      capacity: withdrawCell.cell_output.capacity,
      lock: { ...withdrawCell.cell_output.lock },
      // @ts-ignore
      type: { ...withdrawCell.cell_output.type }
    },
    out_point: {
      tx_hash: txHash,
      index
    },
    data: depositDaoData,
    block_hash: depositBlockHeader.hash,
    block_number: depositBlockHeader.number
  };
}

function extractPrivateKeys(
  txSkeleton: TransactionSkeletonType,
  fromAddresses: string[],
  privateKeys: string[]
): string[] {
  const signingPrivKeys: string[] = [];

  for (let i = 0; i < fromAddresses.length; i += 1) {
    if (
      getScriptFirstIndex(txSkeleton, getLockFromAddress(fromAddresses[i])) !==
      -1
    ) {
      signingPrivKeys.push(privateKeys[i]);
    }
  }

  return signingPrivKeys;
}

function getScriptFirstIndex(
  txSkeleton: TransactionSkeletonType,
  fromScript: Script
): number {
  return txSkeleton
    .get("inputs")
    .findIndex(input =>
      new ScriptValue(input.cell_output.lock, { validate: false }).equals(
        new ScriptValue(fromScript, { validate: false })
      )
    );
}

// Gets the locks script from an address
function getLockFromAddress(address: string): Script {
  return helpers.parseAddress(address, { config: NETWORK });
}

// function getNextAddress(): string {
//   return getAddress(firstRIndexWithoutTxs, AddressType.Receiving);
// }

// // Gets address from a specific accountId, addressType and script type
// function getAddress(accountId = 0, addressType: AddressType, script: AddressScriptType = AddressScriptType.SECP256K1_BLAKE160): string {
//     const key = `${accountId}-${addressType}-${script}`;
//     if (!this.addressMap[key]) {
//         const address = this.connection.getAddressFromLock(this.getLock(accountId, addressType, script));
//         this.addressMap[key] = address;
//     }

//     return this.addressMap[key];
// }
