import { BI } from "@ckb-lumos/lumos";
import { TransactionObject } from "../type";

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

export function formatDate(timeStamp: number = new Date().getTime()) {
  let date = new Date();
  date.setTime(timeStamp); //时间戳为微秒*1,毫秒*1000
  let y = date.getFullYear();
  let m: string | number = date.getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  let d: string | number = date.getDate();
  d = d < 10 ? "0" + d : d;
  let h: string | number = date.getHours();
  h = h < 10 ? "0" + h : h;
  let minute: string | number = date.getMinutes();
  let second: string | number = date.getSeconds();
  minute = minute < 10 ? "0" + minute : minute;
  second = second < 10 ? "0" + second : second;
  return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + second;
}

//First record with map structure
export function arrayToMap(data: TransactionObject[]) {
  //No processing for non array or data length of 0
  if (data.length == 0) {
    return [];
  }
  let map: any = {};
  for (var i = 0; i < data.length; i++) {
    if (data.length < 1) {
      continue;
    }

    let name = data[i].block_number;
    if (name != undefined) {
      if (map[name] == undefined) {
        map[name] = [];
      }
      map[name].push(data[i]);
    }
  }
  let array = mapToArray(map);
  return array;
}

//Convert map to array
export function mapToArray(data: any) {
  if (data == undefined) {
    return [];
  }
  let array = [];
  for (let p in data) {
    array.push(data[p]);
  }
  return array;
}
