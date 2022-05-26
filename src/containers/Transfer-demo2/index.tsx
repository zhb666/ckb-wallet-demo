import React, { useEffect, useState } from "react";
import { Script } from "@ckb-lumos/lumos";
import { capacityOf, generateAccountFromPrivateKey, transfer } from "./lib";
import "./index.scss"

//TODO e2e test
const windowPrivKey = window.sessionStorage.getItem("privKey")


export default function Secp256k1Transfer() {
  const [privKey, setPrivKey] = useState("0x913a1d234419e401db40a8821ac4ba9f4d54f99e977f7857e8768887e4eccd40");
  const [fromAddr, setFromAddr] = useState("");
  const [fromLock, setFromLock] = useState<Script>();
  const [balance, setBalance] = useState("");

  const [toAddr, setToAddr] = useState("ckt1qyqw8c9g9vvemn4dk40zy0rwfw89z82h6fys07ens3");
  const [amount, setAmount] = useState("8800000000");

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
        <li>
          Current lock script:
          <pre>{JSON.stringify(fromLock, null, 2)}</pre>
        </li>

        <li>Total capacity: {balance}</li>
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
        onChange={(e) => setAmount(e.target.value)}
      />
      <br />
      <button
        onClick={() =>
          // TODO e2e Test
          setTimeout(() => {
            transfer({ amount, from: fromAddr, to: toAddr, privKey })
          }, 2000)
        }
      >
        Transfer
      </button>
    </div>
  );
}
