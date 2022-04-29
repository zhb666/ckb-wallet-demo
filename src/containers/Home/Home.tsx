import React, { useEffect, useState } from "react";
import { A } from "hookrouter";
import { Mnemonic } from "../../wallet/hd";
import "./Home.scss";

interface hd {
	m: string,
	extendedPrivateKey: item
}

interface item {
	privateKey: string;
	chainCode: string,
}

const Component: React.FC = () => {
	const [hd, setHd] = useState<hd>({
		m: '',
		extendedPrivateKey: {
			privateKey: '',
			chainCode: ""
		}
	});

	/**
	 * @description: 获取钱包
	 * @param {*}
	 * @return {hd}
	 */
	async function getHD() {
		const hd = await Mnemonic()
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
