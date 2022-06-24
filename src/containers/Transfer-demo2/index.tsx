import React, { useEffect, useState } from "react";
import { Script } from "@ckb-lumos/lumos";
import { capacityOf, generateAccountFromPrivateKey, transfer } from "./lib";
import { notification, Spin, Button } from 'antd';
import { NotificationType } from "../../common/ts/Types"
import { formatDate } from "../../utils/index"
import { FinalDataObject } from "../../type"
import {
  get_transaction
} from "../../rpc";

import Table from '../../components/TransactionsTable'

import "./index.scss"

declare const window: {
  localStorage: {
    getItem: Function;
    setItem: Function;
  };
};
let timer: any = null
export default function Secp256k1Transfer() {
  // 0x9acbab8217e1692799b85e3d784b9132603d816944a17d39b101daf4ff89efd1
  // 0x913a1d234419e401db40a8821ac4ba9f4d54f99e977f7857e8768887e4eccd40
  const [privKey, setPrivKey] = useState("0x913a1d234419e401db40a8821ac4ba9f4d54f99e977f7857e8768887e4eccd40");
  const [fromAddr, setFromAddr] = useState("");
  const [fromLock, setFromLock] = useState<Script>();
  const [balance, setBalance] = useState("");
  const [txHash, setTxHash] = useState<FinalDataObject>({
    timestamp: "",
    amount: "",
    hash: "",
    type: "",
    blockHeight: "",
    state: ""
  });
  const [loading, setLoading] = useState(false);
  const [off, setOff] = useState(true);//pending = false  success = true

  const [toAddr, setToAddr] = useState("ckt1qyqw8c9g9vvemn4dk40zy0rwfw89z82h6fys07ens3");
  const [amount, setAmount] = useState(88);

  const openNotificationWithIcon = (type: NotificationType) => {
    notification[type]({
      message: 'success',
      description:
        "successful transaction",
    });
  };

  // send
  const send = (async () => {
    setLoading(true)
    const txhash = await transfer({ amount: amount * 100000000, from: fromAddr, to: toAddr, privKey });
    if (txhash) {
      setTxHash({
        timestamp: formatDate(new Date().getTime()),
        amount: "-" + amount,
        hash: txhash,
        type: "subtract",
        blockHeight: "",
        state: "pending"
      })
      setOff(false)
      openNotificationWithIcon("success")
      setLoading(false)
    }
  })

  // Judge whether the transaction is success
  useEffect(() => {
    if (txHash.hash) {
      timer = setInterval(async () => {
        const txTransaction = await get_transaction(txHash.hash);
        console.log(txTransaction, "txTransaction______");

        if (txTransaction) {
          // 如果是有交易信息了就关闭定时器，需要传值过去
          clearInterval(timer)
          // 更新缓存

          let finalData = JSON.parse(window.localStorage.getItem('finalData'))
          // 找到当前的交易赋值
          // finalData.forEach((item: FinalDataObject, index: number) => {
          //   console.log(item, "finalData_____");
          // });
          finalData[0].blockHeight = parseInt(txTransaction.header.number)
          finalData[0].timestamp = formatDate(parseInt(txTransaction.header.timestamp))
          finalData[0].state = "success"
          window.localStorage.setItem("finalData", JSON.stringify(finalData))
          setOff(true)
          console.log("关闭了");

        }
      }, 3000)
    }
    return () => clearInterval(timer)
  }, [txHash.hash])


  useEffect(() => {
    const updateFromInfo = async () => {
      const { lockScript, address } = generateAccountFromPrivateKey(privKey);
      const capacity = await capacityOf(address);
      setFromAddr(address);
      setFromLock(lockScript);
      setBalance(capacity.toString());
    };

    if (privKey) {
      updateFromInfo();
    }
  }, [privKey]);

  return (
    <Spin spinning={loading}>
      <div className='mian'>
        <label htmlFor="private-key">Private Key: </label>&nbsp;
        <input
          id="private-key"
          type="text"
          value={privKey}
          onChange={(e) => setPrivKey(e.target.value)}
        />
        <ul>
          <li>CKB Address: {fromAddr}</li>
          {/* <li>
            Current lock script:
            <pre>{JSON.stringify(fromLock, null, 2)}</pre>
          </li> */}

          <li>Total ckb: {Number(balance) / 100000000} </li>
        </ul>
        <label htmlFor="to-address">Transfer to Address: </label>&nbsp;
        <input
          id="to-address"
          type="text"
          value={toAddr}
          onChange={(e) => setToAddr(e.target.value)}
        />
        <br />
        <label htmlFor="amount">Amount</label>
        &nbsp;
        <input
          id="amount"
          type="text"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <br />
        {txHash.hash ? <p>txHash : {txHash.hash}</p> : null}

        {
          off ?
            <Button className='sendButton' type="primary" block onClick={send}>
              Transfer
            </Button> :
            <Button type="primary" block disabled>需要等上一笔上链成功才能发送交易</Button>
        }

        <div className="Table">
          <Table item={txHash} off={off} />
        </div>
      </div>



    </Spin>
  );
}
