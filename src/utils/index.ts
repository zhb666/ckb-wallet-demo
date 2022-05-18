import { BI } from "@ckb-lumos/lumos";

export async function getCapacity(capacity: string) {
  let balance = BI.from(0);
  balance = balance.add(capacity);
  return balance;
}
