import { BI } from "@ckb-lumos/lumos";

export async function getCapacity(capacity: string) {
  let balance = BI.from(0);
  balance = balance.add(capacity);
  return balance;
}

export function cutValue(value: string, preLength = 6, subLength = 6) {
  if (!value || value.length < preLength + subLength) {
    return value;
  }
  return `${value.substr(0, preLength)}...${value.substr(
    value.length - subLength,
    subLength
  )}`;
}
