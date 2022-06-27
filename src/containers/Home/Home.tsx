import React, { useEffect, useState } from "react";
import type { RadioChangeEvent } from 'antd';
import { notification, Radio, Space, Button, Modal, Input } from 'antd';
import { Mnemonic, getPrivateKeyAgs } from "../../wallet/hd";
import { NotificationType } from "../../common/ts/Types"
import { WalletListObject } from "../../type"
import { UserStore } from "../../stores";
import "./Home.scss";
import Item from 'antd/lib/list/Item';

const { TextArea } = Input;

declare const window: {
	localStorage: {
		getItem: Function;
		setItem: Function;
	};
};

const Component: React.FC = () => {
	const UserStoreHox = UserStore();

	const { walletList, script } = UserStoreHox

	// modal
	const [isModalVisible, setIsModalVisible] = useState(false);
	// is import or create
	const [walletType, setWalletType] = useState(true);
	// walletList
	// const [walletList, setWalletList] = useState<WalletListObject>(UserStoreHox.walletList);

	const [wallet, setWallet] = useState<any>();
	const [mnemonic, setMnemonic] = useState('');

	const onChangeWallet = (e: RadioChangeEvent) => {
		setWallet(e.target.value);

		if (!walletList) return
		// 判断当前选中的钱包
		let res = walletList.filter(item =>
			item.privateKeyAgs.lockScript.args == e.target.value
		)

		UserStoreHox.userScript(res[0])
		window.localStorage.setItem("myScript", JSON.stringify(res[0]))
	};

	const openNotificationWithIcon = (type: NotificationType) => {
		notification[type]({
			message: 'success',
			// description:
			// 	"Created success",
		});
	};

	const showModal = (boolean: boolean) => {
		// judge type
		setWalletType(boolean)
		if (boolean) {
			getHD();
		}
		setIsModalVisible(true);
	};

	// click create
	const handleOk = async () => {
		if (!mnemonic) {
			notification["error"]({
				message: 'error',
				description:
					"mnemonic error",
			});
			return
		}
		const res: WalletListObject = await getPrivateKeyAgs(mnemonic);
		console.log(res);
		UserStoreHox.addWalletList(res)

		setIsModalVisible(false);
		openNotificationWithIcon("success")

	};

	const handleCancel = () => {
		setIsModalVisible(false);
		// empty
		setMnemonic("")
	};

	const onMnemonicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setMnemonic(e.target.value)
	};

	/**
	 * @description: 
	 * @param {*}
	 * @return {hd}
	 */
	async function getHD() {
		const hd = await Mnemonic()
		setMnemonic(hd.m)
	}

	useEffect(() => {
		// if (!walletList) return
		let res = walletList.filter(item =>
			item.privateKeyAgs.lockScript.args == script.privateKeyAgs.lockScript.args
		)
		setWallet(res[0].privateKeyAgs.lockScript.args)
	}, [])

	return (
		<main className="home">

			{/* modal */}
			<Modal title={walletType ? "新建钱包" : "导入助记词"} visible={isModalVisible} onOk={handleOk} okText="确认"
				cancelText="取消" closable={false} onCancel={handleCancel}>
				{walletType ? <div>
					已生成新的助记词<TextArea value={mnemonic} onChange={onMnemonicChange} rows={2} />
				</div> : <div>
					请输入你的助记词<TextArea value={mnemonic} onChange={onMnemonicChange} rows={2} />
				</div>}


			</Modal>

			<div className='walletlist'>
				<p className='walletlistTitle'>我的账户</p>
				<Radio.Group onChange={onChangeWallet} value={wallet}>
					<Space direction="vertical">
						{
							UserStoreHox.walletList.map((item, index) => {
								return (
									<Radio key={index} value={item.privateKeyAgs.lockScript.args}>{item.privateKeyAgs.address}</Radio>
								)
							})
						}
					</Space>
				</Radio.Group>

			</div>
			<div className='walletType'>
				<Button className='createWallet' block type="primary" onClick={() => {
					showModal(true)
				}}>
					新建钱包
				</Button>
				<br />
				<Button className='mnemonic' block type="primary" onClick={() => {
					showModal(false)
				}}>
					导入助记词
				</Button>
			</div>
			{/* <p>
				mnemonic:<input readOnly value={hd.m} type="text" placeholder='' />
			</p> */}
			{/* <p>
				Private key:<input readOnly value={hd.extendedPrivateKey.privateKey} type="text" placeholder='' />
			</p> */}
			{/* <button onClick={getHD}>Create Wallet</button> */}
		</main>
	);
};

export default Component;
