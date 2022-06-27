import React, { useEffect, useState } from 'react';
import { Progress as ProgressAnd } from 'antd';
import { UserStore } from "../../stores";
import {
	getScripts,
	getTipHeader
} from "../../rpc";
import './index.scss';

let timer: any = null
function Progress() {
	const UserStoreHox = UserStore();
	const [blockHeight, setBlockHeight] = useState<any>(0);
	const [scriptsHeight, setScriptsHeight] = useState<any>(0);
	const [tipHeader, setTipHeader] = useState<any>(0);

	useEffect(() => {

		clearInterval(timer)

		timer = setInterval(async () => {
			const scriptsRes = await getScripts()
			const tipHeaderRes = await getTipHeader()

			let scriptsFilter = scriptsRes.filter((item: { script: { args: string; }; }) => item.script.args == UserStoreHox.script?.privateKeyAgs.lockScript.args);

			let tipHeaderNum = parseInt(tipHeaderRes.number)

			// 没有匹配上钱包需要处理
			if (scriptsFilter && scriptsFilter[0]?.block_number) {
				let scriptsNum = parseInt(scriptsFilter[0].block_number || 0)

				let height = scriptsNum / tipHeaderNum * 100
				setBlockHeight(Number(height.toFixed(2)))
				setScriptsHeight(scriptsNum)
				setTipHeader(tipHeaderNum)
			} else {
				setBlockHeight(100)
				setScriptsHeight(0)
				setTipHeader(tipHeaderNum)
			}

			// return () => {
			// 	clearInterval(timer)
			// }

		}, 5000)


	}, [UserStoreHox.script])

	return (
		<>

			<ProgressAnd
				type="circle"
				strokeColor={{
					'0%': '#108ee9',
					'100%': '#87d068',
				}}
				width={80}
				percent={blockHeight}

			/>
			<p className='height'>  {scriptsHeight.toLocaleString()} / {tipHeader.toLocaleString()}</p>
			{
				blockHeight >= 100 ? <p>区块数据同步完成...</p> : <p>区块数据同步中...</p>
			}

		</>
	)
}

export default Progress;
