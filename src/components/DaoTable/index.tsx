import React, { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/lib/table';
import { Space, Table, Button, message, notification } from 'antd';
import { IndexerTransaction } from "../../service/type"
import { DaoDataObject, TransactionObject } from "../../type"
import { cutValue, getCapacity, formatDate, arrayToMap } from "../../utils/index"
import { browserUrl } from "../../config"
import { UserStore } from "../../stores";
import { get_cells } from "../../rpc"
import { getUnlockableAmountsFromCells } from "../../wallet/dao/index"

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

const columns: ColumnsType<DaoDataObject> = [
	// {
	// 	title: 'ID',
	// 	render: (text, record, index) => `${index + 1}`,
	// },
	{
		title: 'Date',
		dataIndex: 'timestamp',
		key: 'timestamp',
	},
	{
		title: 'Amount',
		dataIndex: 'amount',
		key: 'amount',
		render: (_, record) => (
			<Space size="middle">
				{Number(record.amount) / 100000000}
			</Space>
		),
	},
	// {
	// 	title: 'Compensation',
	// 	dataIndex: 'compensation',
	// 	key: 'compensation',
	// 	render: (_, record) => (
	// 		<Space size="middle">
	// 			{Number(record.compensation) / 100000000}
	// 		</Space>
	// 	),
	// },
	{
		title: 'View Transaction',
		key: 'tx_index',
		render: (_, record) => (
			<Space size="middle">
				<a>{cutValue(record.txHash, 10, 10)}</a>
			</Space>
		),
	},
	{
		title: 'Type',
		dataIndex: 'type',
		key: 'type',
	},
	{
		title: 'State',
		dataIndex: 'state',
		key: 'state',
	},
];

interface Props {
	item: DaoDataObject;
	off: boolean
}

const TransactionsTable: React.FC<Props> = ({
	item,
	off
}) => {
	const UserStoreHox = UserStore();
	const [tableData, setTableData] = useState<DaoDataObject[]>([])

	// Confirm status
	useEffect(() => {
		if (item.txHash) {
			if (off) {
				// get localStorage
				// let daoData = JSON.parse(window.localStorage.getItem('daoData'))
				// setTableData(daoData);
			} else {
				setTableData([item, ...tableData]);
			}
		}
	}, [item, off])


	// 如果tableData有变化就需要重新设置缓存
	// useEffect(() => {
	// 	if (tableData) {
	// 		window.localStorage.setItem("daoData", JSON.stringify(tableData))
	// 	}

	// }, [tableData])


	// get table data
	const getTableData = async () => {
		const cells = await get_cells(UserStoreHox.script.privateKeyAgs.lockScript)
		const res = await getUnlockableAmountsFromCells(cells.objects)
		let DaoBalance = 0

		for (let i = 0; i < res.length; i++) {
			const transaction = await get_transaction(res[i].txHash);
			res[i].state = "success"
			res[i].timestamp = formatDate(parseInt(transaction.header.timestamp))
			DaoBalance += Number(res[i].amount)
		}
		UserStoreHox.setDaoBalanceFun(DaoBalance)
		console.log(res);

		// window.localStorage.setItem("daoData", JSON.stringify(res))
		setTableData(res.reverse());
	};



	// get row open url
	const getHash = async (transactionsInfo: DaoDataObject) => {
		console.log(transactionsInfo);
		window.open(`${browserUrl.test}/transaction/${transactionsInfo.txHash}`)
	}


	useEffect(() => {
		if (UserStoreHox.script.privateKeyAgs) {
			getTableData()
		}
	}, [UserStoreHox.myBalance])


	return (
		<div className='transactionsTable'>
			<Table rowKey={record => record.txHash} onRow={record => {
				return {
					onClick: event => { getHash(record) },
				};
			}} columns={columns} dataSource={tableData} />
			{/* <Button onClick={getTableData} className='button' type="primary">next</Button> */}
		</div>
	)
}

export default TransactionsTable;
