import { BI } from "@ckb-lumos/lumos";
import { signTransaction } from "./signTransaction";
import { transfer, transactionData } from "./transaction";
import { sendTransaction } from "./sendTransaction";
import {
  deposit,
  getUnlockableAmountsFromCells,
  withdrawOrUnlock
} from "./dao";
import { generateAccountFromPrivateKey } from "./hd";

import { ScriptObject } from "../type";
import { get_cells } from "../rpc";

async function capacityOf(lockScript: ScriptObject): Promise<BI> {
  // Convert to bi object
  let balance = BI.from(0);

  let cells = await get_cells(lockScript);

  for await (const cell of cells.objects) {
    balance = balance.add(cell.cell_output.capacity);
  }
  return balance;
}

export {
  signTransaction,
  transfer,
  capacityOf,
  sendTransaction,
  transactionData,
  deposit,
  generateAccountFromPrivateKey,
  getUnlockableAmountsFromCells,
  withdrawOrUnlock
};
