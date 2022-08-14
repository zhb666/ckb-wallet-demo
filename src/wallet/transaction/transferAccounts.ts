import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { common } from "@ckb-lumos/common-scripts";
import { RPC_NETWORK, TRANSFERCELLSIZE } from "../../config/index";
import { FeeRate } from "../../type";
import { signTransaction } from "../index";
import { getEmptyCellProvider } from "../customCellProvider";

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

  let txSkeleton = TransactionSkeleton({
    cellProvider: getEmptyCellProvider()
  });

  txSkeleton = await common.transfer(
    txSkeleton,
    [from],
    to,
    amount,
    // @ts-ignore
    null,
    null,
    { config: RPC_NETWORK }
  );

  txSkeleton = await common.payFeeByFeeRate(
    txSkeleton,
    [from],
    feeRate,
    // @ts-ignore
    null,
    { config: RPC_NETWORK }
  );

  return signTransaction(txSkeleton, [privateKey]);
}
