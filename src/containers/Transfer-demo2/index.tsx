import React, { useEffect, useState } from "react";
import { Script } from "@ckb-lumos/lumos";
import { capacityOf, generateAccountFromPrivateKey, transfer } from "./lib";
import { notification, Spin, Button } from 'antd';
import {
  QuestionCircleOutlined
} from '@ant-design/icons';
import { NotificationType } from "../../common/ts/Types"
import { formatDate, cutValue } from "../../utils/index"
import { FinalDataObject } from "../../type"
import { UserStore } from "../../stores";
import Table from '../../components/TransactionsTable'

import {
  get_transaction
} from "../../rpc";


import "./index.scss"

declare const window: {
  localStorage: {
    getItem: Function;
    setItem: Function;
  };
};
let timer: any = null
let updateFromInfoTimer: any = null
export default function Secp256k1Transfer() {
  const UserStoreHox = UserStore();

  // 0x9acbab8217e1692799b85e3d784b9132603d816944a17d39b101daf4ff89efd1
  // 0x913a1d234419e401db40a8821ac4ba9f4d54f99e977f7857e8768887e4eccd40
  const [privKey, setPrivKey] = useState(UserStoreHox.script.privateKey);
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

  const [toAddr, setToAddr] = useState("");
  const [amount, setAmount] = useState<any>("");

  const openNotificationWithIcon = (type: NotificationType) => {
    notification[type]({
      message: 'success',
      description:
        "successful transaction",
    });
  };

  // send
  const send = (async () => {
    console.log(toAddr, "toAddr");
    console.log(amount, "amount");

    let msg = ""
    if (!toAddr) {
      msg = "The receiving address is empty"
    }

    if (!amount) {
      msg = "Send ckb cannot be 0"
    }

    if (msg) {
      notification["error"]({
        message: 'error',
        description: msg
      });
      return
    }

    setLoading(true)
    const txhash = await transfer({ amount: parseFloat(amount || "0") * 100000000, from: fromAddr, to: toAddr, privKey });
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
          // Update localStorage

          let finalData = JSON.parse(window.localStorage.getItem('finalData'))
          // 找到当前的交易赋值

          finalData[0].blockHeight = parseInt(txTransaction.header.number)
          finalData[0].timestamp = formatDate(parseInt(txTransaction.header.timestamp))
          finalData[0].state = "success"
          window.localStorage.setItem("finalData", JSON.stringify(finalData))
          setOff(true)
          updateFromInfo()
          console.log("close");

        }
      }, 3000)
    }
    return () => clearInterval(timer)
  }, [txHash.hash])


  const updateFromInfo = async () => {
    const { lockScript, address } = generateAccountFromPrivateKey(privKey);
    const capacity = await capacityOf(address);
    setFromAddr(address);
    setFromLock(lockScript);
    setBalance(capacity.toString());
  };

  useEffect(() => {
    if (privKey) {
      updateFromInfo();
    }
  }, [privKey]);

  // Balance update triggers transaction data update
  useEffect(() => {
    UserStoreHox.setMyBalanceFun(balance)
  }, [balance])

  useEffect(() => {
    //one minute update balance
    if (privKey) {
      updateFromInfoTimer = setInterval(() => {
        updateFromInfo();
      }, 20000)
    }
    return () => clearInterval(updateFromInfoTimer)
  }, []);


  return (
    <Spin spinning={loading}>
      <div className='mian'>
        <h3>Account</h3>
        <ul className='address'>
          <li>CKB Address : {cutValue(fromAddr, 20, 20)}</li>
          <li>Total CKB : {Number(balance) / 100000000} </li>
        </ul>
        <h3>Send to Address</h3>
        <input
          id="to-address"
          type="text"
          placeholder='Please enter receiving address'
          value={toAddr}
          onChange={(e) => setToAddr(e.target.value || '')}
        />
        <br />
        <h3>Amount </h3>
        <input
          id="amount"
          type="text"
          placeholder='Please enter the amount at least 61'
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <br />
        {txHash.hash ? <p>txHash : {txHash.hash}</p> : null}

        {
          off ?
            <Button className='sendButton' type="primary" block onClick={send}>
              Send
            </Button> :
            <Button type="primary" block disabled>需要等上一笔上链成功才能发送交易</Button>
        }

        <h5 className='tips'>
          <QuestionCircleOutlined />  <span>温馨提示:数据需要等待节点同步完成，否则存在数据不存在的情况～</span>
        </h5>

        <div className="Table">
          <Table item={txHash} off={off} />
        </div>
      </div>



    </Spin>
  );
}
