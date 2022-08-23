import { Cell, Script, Header, TransactionWithStatus } from "@ckb-lumos/base";
import { since } from "@ckb-lumos/lumos";
import { dao } from "@ckb-lumos/common-scripts";
import { DAOUnlockableAmount } from "../../type";
import { getCells, getTipHeader, getTransaction, getHeader } from "../../rpc";
import { DEPOSITDAODATA } from "../../config";

export enum DAOCellType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  ALL = "all"
}

const blockHeaderHashMap = new Map<string, Header>();
const blockHeaderNumberMap = new Map<string, Header>();
const transactionMap = new Map<string, TransactionWithStatus>();
const blockTime = 8.02;

// Gets DAO unlockable amounts from the whole wallet
// Should be synchronized first
export async function getDAOUnlockableAmounts(): Promise<
  DAOUnlockableAmount[]
> {
  const res = await getCells();
  return getUnlockableAmountsFromCells(res.objects);
}

export async function filterDAOCells(
  cells: Cell[],
  cellType: DAOCellType = DAOCellType.ALL
): Promise<Cell[]> {
  const filteredCells: Cell[] = [];
  for (const cell of cells) {
    if (isCellDAO(cell)) {
      if (
        (cellType === DAOCellType.WITHDRAW && isCellDeposit(cell)) ||
        (cellType === DAOCellType.DEPOSIT && !isCellDeposit(cell))
      ) {
        continue;
      }

      if (!cell.block_hash && cell.block_number && cell.out_point) {
        const header = await getTransaction(cell.out_point.tx_hash);

        filteredCells.push({ ...cell, block_hash: header.header.hash });
      } else {
        filteredCells.push(cell);
      }
    }
  }

  return filteredCells;
}

export function isCellDeposit(cell: Cell): boolean {
  return cell.data === DEPOSITDAODATA;
}

function isCellDAO(cell: Cell): boolean {
  const daoScript = getDAOScript();
  if (!cell.cell_output.type) {
    return false;
  }

  const { code_hash, hash_type, args } = cell.cell_output.type;
  return (
    code_hash === daoScript.code_hash &&
    hash_type === daoScript.hash_type &&
    args === daoScript.args
  );
}

function getDAOScript(): Script {
  // const daoConfig = getConfig().SCRIPTS.DAO;
  return {
    code_hash:
      "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
    hash_type: "type",
    args: "0x"
  };
}

async function getDepositCellMaximumWithdraw(
  depositCell: Cell
): Promise<bigint> {
  const depositBlockHeader = await getBlockHeaderFromHash(
    depositCell.block_hash as string
  );

  const withdrawBlockHeader = await getCurrentBlockHeader();

  return dao.calculateMaximumWithdraw(
    depositCell,
    depositBlockHeader.dao,
    withdrawBlockHeader.dao
  );
}

// Gets a block header from its hash
export async function getBlockHeaderFromHash(
  blockHash: string
): Promise<Header> {
  if (!blockHeaderHashMap.has(blockHash)) {
    const header = await getHeader(blockHash);
    setBlockHeaderMaps(header);
  }

  return blockHeaderHashMap.get(blockHash) as Header;
}

function setBlockHeaderMaps(header: Header): void {
  blockHeaderHashMap.set(header.hash, header);
  blockHeaderNumberMap.set(header.number, header);
}

export async function getDepositDaoEarliestSince(
  depositCell: Cell
): Promise<bigint> {
  const depositBlockHeader = await getBlockHeaderFromHash(
    depositCell.block_hash as string
  );
  const withdrawBlockHeader = await getCurrentBlockHeader();

  return dao.calculateDaoEarliestSince(
    depositBlockHeader.epoch,
    withdrawBlockHeader.epoch
  );
}

async function getWithdrawCellMaximumWithdraw(
  withdrawCell: Cell
): Promise<bigint> {
  const withdrawBlockHeader = await getBlockHeaderFromHash(
    withdrawCell.block_hash as string
  );
  const { txHash } = await findCorrectInputFromWithdrawCell(withdrawCell);
  const depositTransaction = await getTransactionFromHash(txHash);

  return dao.calculateMaximumWithdraw(
    withdrawCell,
    depositTransaction.header.dao,
    withdrawBlockHeader.dao
  );
}

export async function findCorrectInputFromWithdrawCell(
  withdrawCell: Cell
): Promise<{ index: string; txHash: string }> {
  const transaction = await getTransactionFromHash(
    // @ts-ignore
    withdrawCell.out_point.tx_hash as string
  );

  let index: string = "";
  let txHash: string = "";
  for (let i = 0; i < transaction.transaction.inputs.length && !index; i += 1) {
    const prevOut = transaction.transaction.inputs[i].previous_output;

    const possibleTx = await getTransactionFromHash(prevOut.tx_hash);
    const output = possibleTx.transaction.outputs[parseInt(prevOut.index, 16)];
    if (
      output.type &&
      output.capacity === withdrawCell.cell_output.capacity &&
      output.lock.args === withdrawCell.cell_output.lock.args &&
      output.lock.hash_type === withdrawCell.cell_output.lock.hash_type &&
      output.lock.code_hash === withdrawCell.cell_output.lock.code_hash &&
      // @ts-ignore
      output.type.args === withdrawCell.cell_output.type.args &&
      // @ts-ignore
      output.type.hash_type === withdrawCell.cell_output.type.hash_type &&
      // @ts-ignore
      output.type.code_hash === withdrawCell.cell_output.type.code_hash
    ) {
      index = prevOut.index;
      txHash = prevOut.tx_hash;
    }
  }

  return { index, txHash };
}

// Gets a transaction with status from a hash
// Useful for when the transaction is still not committed
// For transactions that fave not finished you should set useMap = false to not receive the same!
export async function getTransactionFromHash(
  transactionHash: string,
  useMap = true
): Promise<any> {
  if (!useMap || !transactionMap.has(transactionHash)) {
    const transaction = await getTransaction(transactionHash);
    transactionMap.set(transactionHash, transaction);
  }
  return transactionMap.get(transactionHash);
}

export async function getWithdrawDaoEarliestSince(
  withdrawCell: Cell
): Promise<bigint> {
  const withdrawBlockHeader = await getBlockHeaderFromHash(
    withdrawCell.block_hash as string
  );
  const { txHash } = await findCorrectInputFromWithdrawCell(withdrawCell);
  const depositTransaction = await getTransactionFromHash(txHash);

  return dao.calculateDaoEarliestSince(
    depositTransaction.header.epoch,
    withdrawBlockHeader.epoch
  );
}

export async function getUnlockableAmountsFromCells(
  cells: Cell[]
): Promise<DAOUnlockableAmount[]> {
  const unlockableAmounts: DAOUnlockableAmount[] = [];
  const filtCells = await filterDAOCells(cells);

  const currentBlockHeader = await getCurrentBlockHeader();

  const currentEpoch = since.parseEpoch(currentBlockHeader.epoch);

  for (let i = 0; i < filtCells.length; i += 1) {
    const unlockableAmount: DAOUnlockableAmount = {
      amount: BigInt(filtCells[i].cell_output.capacity),
      compensation: BigInt(0),
      unlockable: true,
      remainingCycleMinutes: 0,
      type: "withdraw",
      // @ts-ignore
      txHash: filtCells[i].out_point.tx_hash,
      remainingEpochs: 0
    };

    let maxWithdraw = BigInt(0);
    let earliestSince: since.EpochSinceValue;

    if (isCellDeposit(filtCells[i])) {
      unlockableAmount.type = "deposit";
      // maxWithdraw = BigInt(66603419616);
      maxWithdraw = await getDepositCellMaximumWithdraw(filtCells[i]);

      const sinceBI = await getDepositDaoEarliestSince(filtCells[i]);
      earliestSince = since.parseAbsoluteEpochSince(sinceBI.toString());
    } else {
      // maxWithdraw = BigInt(66603419616);
      maxWithdraw = await getWithdrawCellMaximumWithdraw(filtCells[i]);

      const sinceBI = await getWithdrawDaoEarliestSince(filtCells[i]);
      earliestSince = since.parseAbsoluteEpochSince(sinceBI.toString());
    }

    const remainingEpochs = earliestSince.number - currentEpoch.number;
    unlockableAmount.compensation = maxWithdraw - unlockableAmount.amount;

    if (remainingEpochs === 0) {
      unlockableAmount.remainingEpochs = 0;
      const remainingBlocks = earliestSince.index - currentEpoch.index;
      if (remainingBlocks <= 0) {
        unlockableAmount.remainingCycleMinutes = 0;
      } else {
        unlockableAmount.remainingCycleMinutes =
          (remainingBlocks * blockTime) / 60;
      }
    } else if (remainingEpochs < 0) {
      unlockableAmount.remainingEpochs = 0;
      unlockableAmount.remainingCycleMinutes = 0;
    } else {
      unlockableAmount.remainingEpochs = remainingEpochs;
      let remainingBlocks = currentEpoch.length - currentEpoch.index;
      remainingBlocks += (remainingEpochs - 1) * currentEpoch.length;
      remainingBlocks += earliestSince.index;
      unlockableAmount.remainingCycleMinutes =
        (remainingBlocks * blockTime) / 60;
    }
    unlockableAmount.unlockable =
      currentEpoch.number > earliestSince.number ||
      (currentEpoch.number === earliestSince.number &&
        currentEpoch.index >= earliestSince.index);
    unlockableAmounts.push(unlockableAmount);
  }

  return unlockableAmounts;
}

// Gets latest block header in the blockchain
export async function getCurrentBlockHeader(): Promise<Header> {
  const lastBlockHeader = await getTipHeader();
  return lastBlockHeader;
}
