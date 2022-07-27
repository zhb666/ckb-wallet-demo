import { sealTransaction, TransactionSkeletonType } from "@ckb-lumos/helpers";
import { commons, config, hd } from "@ckb-lumos/lumos";
import { send_transaction } from "../../rpc";
// AGGRON4 for test, LINA for main
const { AGGRON4, LINA } = config.predefined;
const NETWORK = AGGRON4;

export async function signTransaction(
  txSkeleton: TransactionSkeletonType,
  privateKeys: string[]
): Promise<string> {
  const txSkeletonWEntries = commons.common.prepareSigningEntries(txSkeleton, {
    config: NETWORK
  });

  console.log(txSkeletonWEntries, "666");

  // 这里是判断多个钱包还是单个钱包
  if (privateKeys.length !== txSkeletonWEntries.get("signingEntries").count()) {
    console.log("Invalid private keys length");
    throw new Error("Invalid private keys length");
  }

  const signatures = [];
  for (let i = 0; i < privateKeys.length; i += 1) {
    const entry = txSkeletonWEntries.get("signingEntries").get(i);
    // @ts-ignore
    signatures.push(hd.key.signRecoverable(entry.message, privateKeys[i]));
  }
  console.log(signatures, "signatures___");

  const tx = sealTransaction(txSkeletonWEntries, signatures);

  console.log(tx, "tx_______");

  console.log(JSON.stringify(tx, null, 2), "tx");

  const hash = await send_transaction(tx);

  return hash;
}
