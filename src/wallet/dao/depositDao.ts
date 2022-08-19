import { dao, common } from "@ckb-lumos/common-scripts";
import { DAOCELLSIZE, RPC_NETWORK } from "../../config";
import { FeeRate } from "../../type";
import { signTransaction } from "../index";
import { getTransactionSkeleton } from "../customCellProvider";

export async function deposit(
  amount: bigint,
  from: string,
  to: string,
  privateKey: string,
  feeRate: FeeRate = FeeRate.NORMAL
): Promise<string> {
  if (amount < DAOCELLSIZE) {
    throw new Error("Minimum deposit value is 102 CKB");
  }

  let txSkeleton = getTransactionSkeleton();

  txSkeleton = await dao.deposit(txSkeleton, from, to, amount, {
    config: RPC_NETWORK
  });

  txSkeleton = await common.payFeeByFeeRate(
    txSkeleton,
    [from],
    feeRate,
    undefined,
    { config: RPC_NETWORK }
  );

  return signTransaction(txSkeleton, [privateKey]);
}
