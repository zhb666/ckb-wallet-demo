import React, { useEffect, useState } from 'react';
import { Progress as ProgressAnd } from 'antd';
import { getCapacity } from "../../utils";
import {
	getScripts,
	getTipHeader
} from "../../rpc";
import './index.scss';

function Progress() {

	const [blockHeight, setBlockHeight] = useState<any>(0)

	useEffect(() => {

		setInterval(async () => {
			const scriptsRes = await getScripts()
			const tipHeaderRes = await getTipHeader()
			let scriptsNum = await getCapacity(scriptsRes[0].block_number)
			let tipHeaderNum = await getCapacity(tipHeaderRes.number)

			let height = Number(scriptsNum.toString()) / Number(tipHeaderNum.toString()) * 100

			setBlockHeight(height.toFixed(2))
		}, 5000)


	}, [])

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
			{
				blockHeight > 100 ? <p>区块数据同步完成...</p> : <p>区块数据同步中...</p>
			}

		</>
	)
}

export default Progress;