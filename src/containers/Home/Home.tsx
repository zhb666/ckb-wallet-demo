import React, { useEffect, useState } from "react";
import type { RadioChangeEvent } from 'antd';
import { notification, Radio, Space, Button, Modal, Input, Empty } from 'antd';
import {
	CloseCircleOutlined
} from '@ant-design/icons';
import { Mnemonic, getPrivateKeyAgs } from "../../wallet/hd";
import { NotificationType } from "../../common/ts/Types"
import { WalletListObject } from "../../type"
import { UserStore } from "../../stores";
import { cutValue } from "../../utils/index"
import {
	setScripts,
	getScripts,
	getTipHeader
} from "../../rpc";

import "./Home.scss";

const { TextArea } = Input;

declare const window: {
	location: any;
	localStorage: {
		getItem: Function;
		setItem: Function;
	};
};

const Component: React.FC = () => {
	const UserStoreHox = UserStore();

	const { walletList, script, DeleteWallet } = UserStoreHox

	// modal
	const [isModalVisible, setIsModalVisible] = useState(false);
	// is import or create
	const [walletType, setWalletType] = useState(true);
	// walletList
	// const [walletList, setWalletList] = useState<WalletListObject>(UserStoreHox.walletList);

	const [wallet, setWallet] = useState<any>();
	const [mnemonic, setMnemonic] = useState('');

	const onChangeWallet = async (e: RadioChangeEvent) => {
		setWallet(e.target.value);
	};

	const onDeleteAddress = (args: string) => {

		let res = walletList.filter(item =>
			item.privateKeyAgs.lockScript.args !== args
		)

		// const res: any = []

		// for (let index = 0; index < walletList.length; index++) {
		// 	if (walletList[index].privateKeyAgs.lockScript.args !== args) {
		// 		res.push(walletList[index])
		// 	}
		// }

		// set walletList
		DeleteWallet(res)

		if (res.length == 0) return
		setWallet(res[0].privateKeyAgs.lockScript.args);


	}

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
		const res: WalletListObject = await getPrivateKeyAgs(mnemonic, walletType);
		// set add Wallet
		UserStoreHox.addWalletList(res)
		// Set up your first account
		if (walletList && walletList.length == 0) {
			UserStoreHox.userScript(res)
			setWallet(res.privateKeyAgs.lockScript.args)

			if (res.type === "create") {
				// create
				const tipHeaderRes = await getTipHeader()
				await setScripts(res.privateKeyAgs.lockScript, tipHeaderRes.number)
			} else {
				// import
				await setScripts(res.privateKeyAgs.lockScript, "0x0")
			}

		}
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

	const changeWallet = async () => {
		if (!walletList) return
		// ???????????????????????????
		let res: WalletListObject[] = walletList.filter(item =>
			item.privateKeyAgs.lockScript.args == wallet
		)

		UserStoreHox.userScript(res[0])

		// ?????????????????????????????????????????????????????????????????????????????????
		const getScript = await getScripts();
		const getScriptRes = getScript.filter((item: { script: { args: any; }; }) =>
			item.script.args == wallet
		)

		// call setScript
		if (getScriptRes.length !== 0) {
			console.log(getScriptRes);
			// No need to set height
			// await setScripts(res[0].privateKeyAgs.lockScript, getScriptRes[0].block_number || 0)
		} else {
			// ?????????????????????????????????????????????????????????????????????0??????????????????????????????????????????????????????????????????
			if (res[0].type === "create") {
				// create
				const tipHeaderRes = await getTipHeader()
				await setScripts(res[0].privateKeyAgs.lockScript, tipHeaderRes.number)
			} else {
				// import
				await setScripts(res[0].privateKeyAgs.lockScript, "0x0")
			}
		}
	}

	// Public method of wallet change
	useEffect(() => {
		if (!wallet) return
		changeWallet()
	}, [wallet])

	useEffect(() => {
		// Set the initially selected account

		if (walletList && walletList.length == 0) return

		let res = walletList.filter(item =>
			item.privateKeyAgs.lockScript.args == script.privateKeyAgs.lockScript.args
		)
		setWallet(res[0].privateKeyAgs.lockScript.args)
	}, [])

	return (
		<main className="home">

			{/* modal */}
			<Modal title={walletType ? "????????????" : "???????????????"} visible={isModalVisible} onOk={handleOk} okText="??????"
				cancelText="??????" closable={false} onCancel={handleCancel}>
				{walletType ? <div>
					????????????????????????<TextArea value={mnemonic} onChange={onMnemonicChange} rows={2} />
				</div> : <div>
					????????????????????????<TextArea value={mnemonic} onChange={onMnemonicChange} rows={2} />
				</div>}


			</Modal>

			<div className='walletlist'>
				<p className='walletlistTitle'>????????????</p>
				{
					UserStoreHox.walletList.length > 0 ? <Radio.Group onChange={onChangeWallet} value={wallet}>
						<Space direction="vertical">
							{
								UserStoreHox.walletList.map((item, index) => {
									return (
										<Radio key={index} value={item.privateKeyAgs.lockScript.args}>
											{cutValue(item.privateKeyAgs.address, 20, 20)}
											{
												wallet == item.privateKeyAgs.lockScript.args ? <CloseCircleOutlined className='deleteAddress' onClick={() => {
													onDeleteAddress(item.privateKeyAgs.lockScript.args)
												}} /> : null
											}
											{/* <CloseCircleOutlined className='deleteAddress' onClick={() => {
												onDeleteAddress(item.privateKeyAgs.lockScript.args)
											}} /> */}
										</Radio>
									)
								})
							}
						</Space>
					</Radio.Group> : <Empty />
				}
			</div>
			<div className='walletType'>
				<Button className='createWallet' block type="primary" onClick={() => {
					showModal(true)
				}}>
					????????????
				</Button>
				<br />
				<Button className='mnemonic' block type="primary" onClick={() => {
					showModal(false)
				}}>
					???????????????
				</Button>
			</div>
		</main>
	);
};

export default Component;
