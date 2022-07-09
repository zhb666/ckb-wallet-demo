import React, { useEffect, useState } from "react";
import { Button, notification, Empty } from "antd"
import copy from 'copy-to-clipboard';
import { UserStore } from "../../stores";
import QRCode from 'qrcode.react';


import "./index.scss";

const Receive: React.FC = () => {
	const UserStoreHox = UserStore();

	const copyFun = (value: string) => {
		copy(value);
		notification["success"]({
			message: 'Copy success',
		});
	}

	return (
		<div className='receive'>
			<p className='ReceiveAddress'>收款地址</p>
			{
				UserStoreHox.script.privateKeyAgs ? <div>
					<QRCode
						className='QRCode'
						value={UserStoreHox.script.privateKeyAgs.address}
						size={280}
						fgColor="#000000"
					/>
					<div className='address'>
						{UserStoreHox.script.privateKeyAgs.address}
					</div>
					<Button className='copyButton' type="primary" onClick={() => copyFun(UserStoreHox.script.privateKeyAgs.address)}>
						复制地址
					</Button>
				</div> : <Empty />
			}


		</div>
	)

};


export default Receive;

