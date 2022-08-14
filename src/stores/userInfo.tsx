/*
 * @Author: zouxionglin
 * @Description: file content
 */
import { useState } from "react";
import { createModel } from "hox";
import { WalletListObject } from "../type"

declare const window: {
  localStorage: {
    getItem: Function;
    setItem: Function;
  };
};

interface DaoData {
  luck: number,
  Income: number
}


const storageWalletList = JSON.parse(window.localStorage.getItem('walletList')) || []
// myWallet
let myScript = JSON.parse(window.localStorage.getItem('myScript')) || {}

if (storageWalletList.length === 0) {
  myScript = {}
} else {
  if (!myScript) {
    myScript = storageWalletList[0]
  }
}


function useCounter() {

  const [walletList, setWalletList] = useState<WalletListObject[]>(storageWalletList);

  const [script, setScript] = useState<WalletListObject>(myScript);
  const [myBalance, setMyBalance] = useState<string>('');
  const [daoData, setDaoData] = useState<DaoData>({
    luck: 0,
    Income: 0
  });

  const userScript = (script: WalletListObject) => {
    setScript(script);
    window.localStorage.setItem("myScript", JSON.stringify(script))
  }
  const addWalletList = (obj: WalletListObject) => {
    const storageWalletList = JSON.parse(window.localStorage.getItem('walletList')) || [];
    storageWalletList.push(obj)
    setWalletList(storageWalletList);
    window.localStorage.setItem("walletList", JSON.stringify(storageWalletList))
  }
  const DeleteWallet = (walletList: WalletListObject[]) => {
    setWalletList(walletList);
    window.localStorage.setItem("walletList", JSON.stringify(walletList))
  }
  const setMyBalanceFun = (balance: string) => {
    setMyBalance(balance);
  }

  const setDaoDataFun = (obj: DaoData) => {
    setDaoData(obj);
  }

  return {
    walletList,
    script,
    userScript,
    addWalletList,
    myBalance,
    DeleteWallet,
    setMyBalanceFun,
    daoData,
    setDaoDataFun
  };
}

export default createModel(useCounter);
