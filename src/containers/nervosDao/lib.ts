import { Cell, Script, Header, TransactionWithStatus } from "@ckb-lumos/base";
import { since } from "@ckb-lumos/lumos";
import { dao, common } from "@ckb-lumos/common-scripts";
import {
  get_cells,
  getTipHeader,
  get_transaction,
  get_header
} from "../../rpc";

// console.log(
//   dao.calculateMaximumWithdraw(
//     {
//       cell_output: {
//         capacity: "0x14ace47800",
//         lock: {
//           args: "0x2760d76d61cafcfc1a83d9d3d6b70c36fa9d4b1a",
//           code_hash:
//             "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
//           hash_type: "type"
//         },
//         type: {
//           args: "0x",
//           code_hash:
//             "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
//           hash_type: "type"
//         }
//       },
//       data: "0x0000000000000000",
//       out_point: {
//         index: "0x0",
//         tx_hash:
//           "0xec36aab36f1a2598c16dc44266b110e25b43a703fe9f6a24917458635a5cd703"
//       },
//       block_number: "0x5d548c",
//       block_hash:
//         "0xf999b97f66a8f808294fcb84dcfd1232959b344af644c30d14bc03d4ff79dfb0"
//     },
//     "0xee6a4d83ca4a4d3f58d271ad8842260011c3f0aa59d07e030036897b61853508",
//     "0xcf315ee27e3c593f89bfd792484426005d90a3fd7f5581030078149e56593608"
//   ),
//   "dao_sssd"
// );

export interface DAOUnlockableAmount {
  state?: string;
  timestamp?: string;
  type: "deposit" | "withdraw";
  amount: bigint;
  compensation: bigint;
  unlockable: boolean;
  remainingCycleMinutes: number;
  remainingEpochs: number;
  txHash: string;
}

export enum DAOCellType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  ALL = "all"
}

const depositDaoData = "0x0000000000000000";
const blockHeaderHashMap = new Map<string, Header>();
const blockHeaderNumberMap = new Map<string, Header>();
const transactionMap = new Map<string, TransactionWithStatus>();
const blockTime = 8.02;

// Gets DAO unlockable amounts from the whole wallet
// Should be synchronized first
export async function getDAOUnlockableAmounts(): Promise<
  DAOUnlockableAmount[]
> {
  const res = await get_cells();

  return getUnlockableAmountsFromCells(res.objects);
}

async function filterDAOCells(
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
        const header = await get_transaction(cell.out_point.tx_hash);

        filteredCells.push({ ...cell, block_hash: header.header.hash });
      } else {
        filteredCells.push(cell);
      }
    }
  }

  return filteredCells;
}

function isCellDeposit(cell: Cell): boolean {
  return cell.data === depositDaoData;
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

  console.log(
    depositCell,
    depositBlockHeader.dao,
    withdrawBlockHeader.dao,
    "dao____sdawww22"
  );

  return dao.calculateMaximumWithdraw(
    {
      cell_output: {
        capacity: "0x14ace47800",
        lock: {
          args: "0x2760d76d61cafcfc1a83d9d3d6b70c36fa9d4b1a",
          code_hash:
            "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
          hash_type: "type"
        },
        type: {
          args: "0x",
          code_hash:
            "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
          hash_type: "type"
        }
      },
      data: "0x0000000000000000",
      out_point: {
        index: "0x0",
        tx_hash:
          "0xec36aab36f1a2598c16dc44266b110e25b43a703fe9f6a24917458635a5cd703"
      },
      block_number: "0x5d548c",
      block_hash:
        "0xf999b97f66a8f808294fcb84dcfd1232959b344af644c30d14bc03d4ff79dfb0"
    },
    "0xee6a4d83ca4a4d3f58d271ad8842260011c3f0aa59d07e030036897b61853508",
    "0xcf315ee27e3c593f89bfd792484426005d90a3fd7f5581030078149e56593608"
  );
}

// Gets a block header from its hash
async function getBlockHeaderFromHash(blockHash: string): Promise<Header> {
  if (!blockHeaderHashMap.has(blockHash)) {
    const header = await get_header(blockHash);
    setBlockHeaderMaps(header);
  }

  return blockHeaderHashMap.get(blockHash) as Header;
}

function setBlockHeaderMaps(header: Header): void {
  blockHeaderHashMap.set(header.hash, header);
  blockHeaderNumberMap.set(header.number, header);
}

async function getDepositDaoEarliestSince(depositCell: Cell): Promise<bigint> {
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
  console.log(withdrawCell, "withdrawCell");

  const withdrawBlockHeader = await getBlockHeaderFromHash(
    withdrawCell.block_hash as string
  );
  const { txHash } = await findCorrectInputFromWithdrawCell(withdrawCell);
  const depositTransaction = await getTransactionFromHash(txHash);

  console.log(withdrawCell, "withdrawCell");
  console.log(depositTransaction.header.dao, "dao");
  console.log(withdrawBlockHeader.dao, "withdrawBlockHeader.dao");

  // const depositBlockHeader = await getBlockHeaderFromHash(
  //   depositTransaction.tx_status.block_hash as string
  // );
  return dao.calculateMaximumWithdraw(
    withdrawCell,
    depositTransaction.header.dao,
    withdrawBlockHeader.dao
  );

  // return dao.calculateMaximumWithdraw(
  //   withdrawCell,
  //   depositBlockHeader.dao,
  //   withdrawBlockHeader.dao
  // );
}

async function findCorrectInputFromWithdrawCell(
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
async function getTransactionFromHash(
  transactionHash: string,
  useMap = true
): Promise<any> {
  if (!useMap || !transactionMap.has(transactionHash)) {
    const transaction = await get_transaction(transactionHash);
    transactionMap.set(transactionHash, transaction);
  }
  return transactionMap.get(transactionHash);
}

async function getWithdrawDaoEarliestSince(
  withdrawCell: Cell
): Promise<bigint> {
  const withdrawBlockHeader = await getBlockHeaderFromHash(
    withdrawCell.block_hash as string
  );
  const { txHash } = await findCorrectInputFromWithdrawCell(withdrawCell);
  const depositTransaction = await getTransactionFromHash(txHash);
  // const depositBlockHeader = await getBlockHeaderFromHash(
  //   depositTransaction.tx_status.block_hash as string
  // );

  return dao.calculateDaoEarliestSince(
    depositTransaction.header.epoch,
    withdrawBlockHeader.epoch
  );

  // return dao.calculateDaoEarliestSince(
  //   depositBlockHeader.epoch,
  //   withdrawBlockHeader.epoch
  // );
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
      maxWithdraw = BigInt(66603419616);
      // maxWithdraw = await getDepositCellMaximumWithdraw(filtCells[i]);

      const sinceBI = await getDepositDaoEarliestSince(filtCells[i]);
      earliestSince = since.parseAbsoluteEpochSince(sinceBI.toString());
    } else {
      maxWithdraw = BigInt(66603419616);
      // maxWithdraw = await getWithdrawCellMaximumWithdraw(filtCells[i]);

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
async function getCurrentBlockHeader(): Promise<Header> {
  const lastBlockHeader = await getTipHeader();
  return lastBlockHeader;
}
