import React, { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/lib/table';
import { Space, Table, Button, message } from 'antd';
import { IndexerTransaction } from "../../service/type"
import { cutValue, getCapacity, formatDate } from "../../utils/index"
import { div } from "../../utils/bigNumber"
import { tableData as transactionsData } from "../../service/data"

import {
	get_transactions,
	get_transaction
} from "../../rpc";
import './index.scss';

// interface Transaction {
// 	title
// }


const columns: ColumnsType<IndexerTransaction> = [
	{
		title: 'ID',
		render: (text, record, index) => `${index + 1}`,
	},
	{
		title: 'Type',
		dataIndex: 'type',
		key: 'type',
	},
	{
		title: 'Date',
		dataIndex: 'timestamp',
		key: 'timestamp',
	},
	{
		title: 'BlockHeighr',
		dataIndex: 'blockHeight',
		key: 'blockHeight',
	},
	{
		title: 'coinQuantity',
		dataIndex: 'coinQuantity',
		key: 'coinQuantity',
	},
	{
		title: 'View Transaction',
		key: 'tx_index',
		render: (_, record) => (
			<Space size="middle">
				<a>{cutValue(record.hash, 10, 10)}</a>
			</Space>
		),
	},
];

const data: IndexerTransaction[] = [

];


const TransactionsTable: React.FC = () => {

	const getBlockHeight = async (val: string) => {
		const num = await getCapacity(val).toString();
		return num
	}


	const [tableData, setTableData] = useState<IndexerTransaction[]>(data)
	const [lastCursor, setLastCursor] = useState<string>('')

	// get table data
	const getTableData = async () => {
		// 结果
		const finalData = []
		// const res = await get_transactions(lastCursor);
		// console.log(res, "res____")
		// if (res && res.objects.length == 0) {
		// 	message.warning('The data is in the end');
		// 	return
		// } else {

		// 	setLastCursor(res.lastCursor)
		// }

		console.log(transactionsData, "transactionsData___");


		//TODO 数据改成接口拿到的数据
		for (let tabs of transactionsData) {
			// output
			let outputs = tabs.filter(item => item.io_type != "input");
			// input
			let inputs = tabs.filter(item => item.io_type != "output");
			// 收入
			if (inputs.length == 0) {
				const res = await incomeFun(outputs);
				finalData.push(res)
			}
			// 转账
			else {
				const res = await transferFun(inputs, outputs);
				finalData.push(res)
			}
		}
		console.log(finalData, "finalData____");
		setTableData(finalData);

	};

	// 到账相关
	const incomeFun = async (output: any) => {
		// TODO 做下类型检查
		const obj: any = {}
		const res = await get_transaction(output[0].transaction.hash);
		obj.timestamp = formatDate(parseInt(res.header.timestamp))
		obj.hash = res.transaction.hash
		obj.type = "add"
		obj.blockHeight = parseInt(res.header.number)
		// obj.money = (await getCapacity(res.transaction.outputs[0].capacity)).toString()
		obj.coinQuantity = parseInt(res.transaction.outputs[0].capacity) / 100000000

		return obj
	}

	// 转账相关
	const transferFun = async (inputs: any, output: any) => {
		console.log(output, "output____")
		// TODO 做下类型检查
		const obj: any = {
			coinQuantity: 0
		}

		// 单独请求一次，拿头部的信息
		const res = await get_transaction(inputs[0].transaction.hash);
		obj.timestamp = formatDate(parseInt(res.header.timestamp))
		obj.hash = res.transaction.hash
		obj.type = "reduce"
		obj.blockHeight = parseInt(res.header.number)

		// 请求相关的previous_output
		for (let i = 0; i < inputs.length; i++) {
			let since = parseInt(inputs[i].transaction.inputs[i].previous_output.index)
			const res = await get_transaction(inputs[i].transaction.inputs[i].previous_output.tx_hash);

			obj.coinQuantity += parseInt(res.transaction.outputs[since].capacity)
		}

		obj.coinQuantity = (obj.coinQuantity - parseInt(output[0].transaction.outputs[parseInt(output[0].io_index)].capacity)) / 100000000

		return obj

	}

	// 获取每行详情
	const getHash = async (transactionsInfo: IndexerTransaction) => {
		console.log(transactionsInfo)
	}



	useEffect(() => {
		getTableData()
	}, [lastCursor])


	return (
		// rowKey={columns => columns.io_type
		<div className='transactionsTable'>
			<Table onRow={record => {
				return {
					onClick: event => { getHash(record) },
				};
			}} columns={columns} pagination={false} dataSource={tableData} />
			<Button onClick={getTableData} className='button' type="primary">next</Button>
		</div>
	)
}

export default TransactionsTable;