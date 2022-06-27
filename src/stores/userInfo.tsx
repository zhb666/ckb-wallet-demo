/*
 * @Author: zouxionglin
 * @Description: file content
 */
import { useState } from "react";
import { createModel } from "hox";
import { ScriptObject, WalletListObject } from "../type"

declare const window: {
  localStorage: {
    getItem: Function;
    setItem: Function;
  };
};


const storageWalletList = JSON.parse(window.localStorage.getItem('walletList')) || []
// 当前钱包
let myScript = JSON.parse(window.localStorage.getItem('myScript')) || {}

if (storageWalletList.length == 0) {
  myScript = []
} else {
  if (!myScript) {
    myScript = storageWalletList[0]
  }
}

console.log(myScript, "myScript_______");



function useCounter() {

  const [walletList, setWalletList] = useState<WalletListObject[]>(storageWalletList);

  const [script, setScript] = useState<WalletListObject>(myScript);

  const userScript = (script: WalletListObject) => setScript(script);
  const addWalletList = (obj: WalletListObject) => {

    const storageWalletList = JSON.parse(window.localStorage.getItem('walletList')) || [];
    storageWalletList.push(obj)
    setWalletList(storageWalletList);
    window.localStorage.setItem("walletList", JSON.stringify(storageWalletList))
  }

  return {
    walletList,
    script,
    userScript,
    addWalletList
  };
}

export default createModel(useCounter);
