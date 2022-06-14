import React, { useEffect, useState } from 'react';
import { Progress as ProgressAnd } from 'antd';
import { getCapacity } from "../../utils";
import {
	getScripts,
	getTipHeader
} from "../../rpc";
import './index.scss';

function Progress() {

	const [blockHeight, setBlockHeight] = useState(0)

	useEffect(() => {

		setInterval(async () => {
			// const scriptsRes = await getScripts()
			// const tipHeaderRes = await getTipHeader()
			// let scriptsNum = await getCapacity(scriptsRes).toString()
			// let tipHeaderNum = await getCapacity(tipHeaderRes).toString()
			// let height = scriptsNum / tipHeaderNum * 100


			let TipHeader = 100000;
			let ScriptsRes = 10;
			let height = ScriptsRes / TipHeader * 100

			setBlockHeight(height)

			ScriptsRes++

			console.log(ScriptsRes, height)

		}, 2000)


	}, [])

	return (
		<>
			<ProgressAnd
				type="circle"
				strokeColor={{
					'0%': '#108ee9',
					'100%': '#87d068',
				}}
				percent={blockHeight}

			/>
			<p>区块数据同步中...</p>
		</>
	)
}

export default Progress;
