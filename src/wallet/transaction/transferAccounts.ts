import { common } from "@ckb-lumos/common-scripts";
import { RPC_NETWORK, TRANSFERCELLSIZE } from "../../config/index";
import { FeeRate } from "../../type";
import { signTransaction } from "../index";
import { getTransactionSkeleton } from "../customCellProvider";

export async function transfer(
  amount: bigint,
  from: string,
  to: string,
  privateKey: string,
  feeRate: FeeRate = FeeRate.NORMAL
): Promise<string> {
  if (amount < TRANSFERCELLSIZE) {
    throw new Error("Minimum transfer (cell) value is 61 CKB");
  }

  let txSkeleton = getTransactionSkeleton();

  txSkeleton = await common.transfer(
    txSkeleton,
    [from],
    to,
    amount,
    undefined,
    undefined,
    { config: RPC_NETWORK }
  );

  txSkeleton = await common.payFeeByFeeRate(
    txSkeleton,
    [from],
    feeRate,
    undefined,
    { config: RPC_NETWORK }
  );

  return signTransaction(txSkeleton, [privateKey]);
}
