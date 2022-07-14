import React, { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/lib/table';
import { Space, Table, Button, message, notification } from 'antd';
import { IndexerTransaction } from "../../service/type"
import { FinalDataObject, TransactionObject } from "../../type"
import { cutValue, getCapacity, formatDate, arrayToMap } from "../../utils/index"
import { browserUrl } from "../../config/url"
import { tableData as transactionsData } from "../../service/data"
import { UserStore } from "../../stores";

import {
	get_transactions,
	get_transaction
} from "../../rpc";
import './index.scss';

declare const window: {
	localStorage: {
		getItem: Function;
		setItem: Function;
	};
	open: Function
};

const columns: ColumnsType<FinalDataObject> = [
	// {
	// 	title: 'ID',
	// 	render: (text, record, index) => `${index + 1}`,
	// },
	// {
	// 	title: 'Type',
	// 	dataIndex: 'type',
	// 	key: 'type',
	// },
	{
		title: 'Date',
		dataIndex: 'timestamp',
		key: 'timestamp',
	},
	{
		title: 'Block Height',
		dataIndex: 'blockHeight',
		key: 'blockHeight',
	},
	{
		title: 'Amount',
		dataIndex: 'amount',
		key: 'amount',
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
	{
		title: 'State',
		dataIndex: 'state',
		key: 'state',
	},
];

interface Props {
	item: FinalDataObject;
	off: boolean
}

const TransactionsTable: React.FC<Props> = ({
	item,
	off
}) => {
	const UserStoreHox = UserStore();
	const [tableData, setTableData] = useState<FinalDataObject[]>([])
	const [lastCursor, setLastCursor] = useState<number>(0)


	// Confirm status
	useEffect(() => {
		if (item.hash) {
			if (off) {
				// get localStorage
				let finalData = JSON.parse(window.localStorage.getItem('finalData'))
				setTableData(finalData);
			} else {
				setTableData([item, ...tableData]);
			}
		}
	}, [item, off])


	// 如果tableData有变化就需要重新设置缓存
	useEffect(() => {
		if (tableData) {
			window.localStorage.setItem("finalData", JSON.stringify(tableData))
		}

	}, [tableData])


	// get table data
	const getTableData = async () => {
		// Result data
		const finalData: FinalDataObject[] = []
		const res = await get_transactions(UserStoreHox.script.privateKeyAgs.lockScript);

		const filterRes = arrayToMap(res.objects);

		for (let tabs of filterRes) {
			// output
			let outputs = tabs.filter((item: { io_type: string; }) => item.io_type != "input");
			// input
			let inputs = tabs.filter((item: { io_type: string; }) => item.io_type != "output");
			// income
			if (inputs.length == 0) {
				const res = await incomeFun(outputs);
				finalData.push(res)
			}
			// transfer accounts
			else {
				const res = await transferFun(inputs, outputs);
				finalData.push(res)
			}
		}
		window.localStorage.setItem("finalData", JSON.stringify(finalData))
		setTableData(finalData);

	};

	// income related
	const incomeFun = async (output: TransactionObject[]) => {
		const obj: FinalDataObject = {
			timestamp: "",
			amount: 0,
			hash: "",
			type: "",
			blockHeight: 0,
			state: ""
		}
		const res = await get_transaction(output[0].transaction.hash);
		obj.timestamp = formatDate(parseInt(res.header.timestamp))
		obj.hash = res.transaction.hash
		obj.type = "add"
		obj.state = "success"
		obj.blockHeight = parseInt(res.header.number)
		// obj.money = (await getCapacity(res.transaction.outputs[0].capacity)).toString()
		obj.amount = '+' + parseInt(res.transaction.outputs[0].capacity) / 100000000
		return obj
	}

	// Transfer related
	const transferFun = async (inputs: TransactionObject[], output: TransactionObject[]) => {
		const obj: FinalDataObject = {
			timestamp: "",
			amount: 0,
			hash: "",
			type: "",
			blockHeight: 0,
			state: ""
		}

		// Make a separate request and get the header information
		const res = await get_transaction(inputs[0].transaction.hash);
		obj.timestamp = formatDate(parseInt(res.header.timestamp))
		obj.hash = res.transaction.hash
		obj.type = "subtract"
		obj.state = "success"
		obj.blockHeight = parseInt(res.header.number)

		// previous_output
		for (let i = 0; i < inputs.length; i++) {
			let since = parseInt(inputs[i].transaction.inputs[i].previous_output.index)
			const res = await get_transaction(inputs[i].transaction.inputs[i].previous_output.tx_hash);

			obj.amount += parseInt(res.transaction.outputs[since].capacity)
		}
		obj.amount = '-' + (obj.amount - parseInt(output[0].transaction.outputs[parseInt(output[0].io_index)].capacity)) / 100000000
		return obj

	}

	// get row open url
	const getHash = async (transactionsInfo: FinalDataObject) => {
		console.log(transactionsInfo);
		window.open(`${browserUrl.test}/transaction/${transactionsInfo.hash}`)
	}


	useEffect(() => {
		if (UserStoreHox.script.privateKeyAgs) {
			getTableData()
		}
	}, [UserStoreHox.myBalance])


	return (
		<div className='transactionsTable'>
			<Table rowKey={record => record.hash} onRow={record => {
				return {
					onClick: event => { getHash(record) },
				};
			}} columns={columns} dataSource={tableData} />
			{/* <Button onClick={getTableData} className='button' type="primary">next</Button> */}
		</div>
	)
}

export default TransactionsTable;
