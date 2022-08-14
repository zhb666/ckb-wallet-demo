import { Transaction } from "@ckb-lumos/lumos";
import { send_transaction } from "../../rpc";

async function sendTransaction(tx: Transaction) {
  const hash = await send_transaction(tx);
  console.log(hash);
  return hash;
}

export { sendTransaction };
