import React, { useEffect, useState } from "react";
import { Script } from "@ckb-lumos/lumos";
import { capacityOf, generateAccountFromPrivateKey } from "../../wallet";
import { deposit } from "../../wallet/dao";
import { notification, Spin, Button } from 'antd';
import {
	QuestionCircleOutlined
} from '@ant-design/icons';
import { NotificationType } from "../../common/ts/Types"
import { formatDate, cutValue } from "../../utils/index"
import { minus } from "../../utils/bigNumber"
import { DaoDataObject } from "../../type"
import { UserStore } from "../../stores";
import Table from '../../components/DaoTable'

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
	const userStoreHox = UserStore();
	const { privateKey, privateKeyAgs } = userStoreHox.script

	// 0x9acbab8217e1692799b85e3d784b9132603d816944a17d39b101daf4ff89efd1
	// 0x913a1d234419e401db40a8821ac4ba9f4d54f99e977f7857e8768887e4eccd40
	const [privKey, setPrivKey] = useState(privateKey);
	const [fromAddr, setFromAddr] = useState("");
	const [fromLock, setFromLock] = useState<Script>();
	const [balance, setBalance] = useState("");
	const [txHash, setTxHash] = useState<DaoDataObject>({
		timestamp: formatDate(new Date().getTime()),
		amount: BigInt(0),
		txHash: "",
		type: "deposit",
		state: "pending",
		remainingEpochs: 0,
		compensation: BigInt(0),
		unlockable: false,
		remainingCycleMinutes: 0
	});
	const [loading, setLoading] = useState(false);
	const [off, setOff] = useState(true);//pending = false  success = true

	const [amount, setAmount] = useState<any>("");

	const openNotificationWithIcon = (type: NotificationType) => {
		notification[type]({
			message: 'success',
			description:
				"successful transaction",
		});
	};

	// Deposit
	const Deposit = (async () => {

		let msg = ""
		if (!amount) {
			msg = "Deposit ckb cannot be 0"
		}

		if (msg) {
			notification["error"]({
				message: 'error',
				description: msg
			});
			return
		}

		setLoading(true)
		const txhash = await deposit({ amount: parseFloat(amount || "0") * 100000000, from: fromAddr, privKey });
		if (txhash) {
			setTxHash({
				timestamp: formatDate(new Date().getTime()),
				amount: parseFloat(amount || "0") * 100000000,
				txHash: txhash,
				type: "deposit",
				state: "pending",
				remainingEpochs: 0,
				compensation: BigInt(0),
				unlockable: false,
				remainingCycleMinutes: 0
			})
			setOff(false)
			openNotificationWithIcon("success")
			setLoading(false)
		}
	})

	// Judge whether the transaction is success
	useEffect(() => {
		if (txHash.txHash) {
			timer = setInterval(async () => {
				const txTransaction = await get_transaction(txHash.txHash);
				console.log(txTransaction, "txTransaction______");

				if (txTransaction) {
					// ??????????????????????????????????????????????????????????????????
					clearInterval(timer)
					// Update localStorage

					let finalData = JSON.parse(window.localStorage.getItem('finalData'))
					// ???????????????????????????

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
	}, [txHash.txHash])


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
		userStoreHox.setMyBalanceFun(balance)
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
					<li>Available CKB : {minus(Number(balance) / 100000000, userStoreHox.daoBalance / 100000000)} </li>
					<li>Nervos DAO ???????????? : {userStoreHox.daoBalance / 100000000} </li>
				</ul>
				<h3>Amount </h3>
				<input
					id="amount"
					type="text"
					placeholder='Please enter the amount at least 102 CKB'
					value={amount}
					onChange={(e) => setAmount(Number(e.target.value))}
				/>
				<br />
				{txHash.txHash ? <p>txHash : {txHash.txHash}</p> : null}

				{
					off ?
						<Button className='sendButton' type="primary" block onClick={Deposit}>
							Deposit
						</Button> :
						<Button type="primary" block disabled>????????????????????????????????????????????????</Button>
				}

				<h5 className='tips'>
					<QuestionCircleOutlined />  <span>????????????:??????????????????????????????????????????????????????????????????????????????</span>
				</h5>

				<div className="Table">
					<Table item={txHash} off={off} />
				</div>
			</div>
		</Spin>
	);
}
