import React, { useEffect, useState } from "react";
import { A } from "hookrouter";
import { notification } from 'antd';
import { Mnemonic } from "../../wallet/hd";
import { NotificationType } from "../../common/ts/Types"
import "./Home.scss";

interface hd {
	m: string,
	extendedPrivateKey: item
}

interface item {
	privateKey: string;
	chainCode: string,
}

// type NotificationType = 'success' | 'info' | 'warning' | 'error';

const Component: React.FC = () => {
	const [hd, setHd] = useState<hd>({
		m: '',
		extendedPrivateKey: {
			privateKey: '',
			chainCode: ""
		}
	});

	const openNotificationWithIcon = (type: NotificationType) => {
		notification[type]({
			message: 'success',
			description:
				"Created successfully",
		});
	};

	/**
	 * @description: 获取钱包
	 * @param {*}
	 * @return {hd}
	 */
	async function getHD() {
		const hd = await Mnemonic()
		openNotificationWithIcon("success")
		setHd(hd)
	}

	return (
		<main className="home">
			<button onClick={getHD}>Create Wallet</button>
			<p>
				mnemonic:<input readOnly value={hd.m} type="text" placeholder='' />
			</p>
			<p>
				Private key:<input readOnly value={hd.extendedPrivateKey.privateKey} type="text" placeholder='' />
			</p>


		</main>
	);
};

export default Component;
