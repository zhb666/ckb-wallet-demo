import { Transaction } from "@ckb-lumos/lumos";
import { sendTransaction as send_Transaction } from "../../rpc";

async function sendTransaction(tx: Transaction) {
  const hash = await send_Transaction(tx);
  console.log(hash);
  return hash;
}

export { sendTransaction };
