import React, { useEffect, useState } from "react";
import type { RadioChangeEvent } from 'antd';
import { notification, Radio, Space, Button, Modal, Input, Empty } from 'antd';
import {
	CloseCircleOutlined, CopyFilled
} from '@ant-design/icons';
import copy from 'copy-to-clipboard';
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

// declare const window: {
// 	location: any;
// 	localStorage: {
// 		getItem: Function;
// 		setItem: Function;
// 	};
// };

const Component: React.FC = () => {
	const UserStoreHox = UserStore();
	const { walletList, script, DeleteWallet } = UserStoreHox

	// modal
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [deleteAdressModal, setDeleteAdressModal] = useState(false);
	const [deleteAdressArgs, setDeleteAdressArgs] = useState("");
	// 1 create 2 importMnemonic 3 importPrivatekey
	const [walletType, setWalletType] = useState(1);
	// walletList
	// const [walletList, setWalletList] = useState<WalletListObject>(UserStoreHox.walletList);

	const [wallet, setWallet] = useState<any>();
	const [mnemonic, setMnemonic] = useState('');

	const onChangeWallet = async (e: RadioChangeEvent) => {
		setWallet(e.target.value);
	};

	const onOpenDeleteModel = (args: string) => {
		setDeleteAdressModal(true)
		setDeleteAdressArgs(args)
	}

	const onDeleteAddress = () => {
		let res = walletList.filter(item =>
			item.privateKeyAgs.lockScript.args !== deleteAdressArgs
		)
		// set walletList
		DeleteWallet(res)
		if (res.length == 0) return
		setWallet(res[0].privateKeyAgs.lockScript.args);
		setDeleteAdressArgs("")
		setDeleteAdressModal(false)
	}


	const openNotificationWithIcon = (type: NotificationType) => {
		notification[type]({
			message: 'success'
		});
	};

	const showModal = (type: number) => {
		// judge type
		setWalletType(type)
		if (type === 1) {
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

	const copyFun = (value: string) => {
		copy(value);
		notification["success"]({
			message: 'Copy success',
		});
	}

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
		// Determine the currently selected wallet
		let res: WalletListObject[] = walletList.filter(item =>
			item.privateKeyAgs.lockScript.args == wallet
		)
		UserStoreHox.userScript(res[0])
		// First get the previous synchronization height, if it does not start from zero, take it out and pass the value
		const getScript = await getScripts();
		const getScriptRes = getScript.filter((item: { script: { args: any; }; }) =>
			item.script.args == wallet
		)

		// call setScript
		if (getScriptRes.length !== 0) {
			// No need to set height
			// await setScripts(res[0].privateKeyAgs.lockScript, getScriptRes[0].block_number || 0)
		} else {
			// If it is an imported wallet, if it does not match the height of synchronization, it needs to start synchronization from 0. If it is a newly created wallet, it can synchronize the highest block.
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
			<Modal title={walletType === 1 ? "新建钱包" : "导入钱包"} visible={isModalVisible} onOk={handleOk} okText="确认"
				cancelText="取消" closable={false} onCancel={handleCancel}>
				{walletType === 1 ? <div>
					已生成新的助记词<TextArea value={mnemonic} onChange={onMnemonicChange} rows={2} />
				</div> : <div>
					{walletType === 2 ? "请输入你的助记词" : "请输入你的私钥"}<TextArea value={mnemonic} onChange={onMnemonicChange} rows={2} />
				</div>}
			</Modal>

			<Modal title="确认删除钱包？" visible={deleteAdressModal} onOk={onDeleteAddress} okText="确认"
				cancelText="取消" closable={false} onCancel={() => {
					setDeleteAdressModal(false)
				}}>
				删除当前钱包
			</Modal>

			<div className='walletlist'>
				<p className='walletlistTitle'>我的账户</p>
				{
					UserStoreHox.walletList.length > 0 ? <Radio.Group onChange={onChangeWallet} value={wallet}>
						<Space direction="vertical">
							{
								UserStoreHox.walletList.map((item, index) => {
									return (
										<Radio key={index} value={item.privateKeyAgs.lockScript.args}>
											{cutValue(item.privateKeyAgs.address, 20, 20)}
											<CopyFilled className='copy' onClick={() => copyFun(item.privateKeyAgs.address)} />
											{
												wallet == item.privateKeyAgs.lockScript.args ? <CloseCircleOutlined className='deleteAddress' onClick={() => {
													onOpenDeleteModel(item.privateKeyAgs.lockScript.args)
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
					showModal(1)
				}}>
					新建钱包
				</Button>
				<Button className='mnemonic' block type="primary" onClick={() => {
					showModal(2)
				}}>
					导入助记词
				</Button>
				<Button className='mnemonic' block type="primary" onClick={() => {
					showModal(3)
				}}>
					导入私钥
				</Button>
			</div>
		</main>
	);
};

export default Component;
