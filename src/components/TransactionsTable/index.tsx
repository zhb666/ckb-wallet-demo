import React, { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/lib/table';
import { Space, Table } from 'antd';
import { FinalDataObject } from "../../type"
import { cutValue, arrayToMap } from "../../utils/index"
import { browserUrl } from "../../config"
import { UserStore } from "../../stores";
import { transactionData } from '../../wallet';
import {
	getTransactions,
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

	// If tableData changes, you need to reset the cache
	useEffect(() => {
		if (tableData) {
			window.localStorage.setItem("finalData", JSON.stringify(tableData))
		}

	}, [tableData])

	// get table data
	const getTableData = async () => {
		const res = await getTransactions(UserStoreHox.script.privateKeyAgs.lockScript);
		const filterRes = arrayToMap(res.objects);
		// Result data
		let finalData: FinalDataObject[] = []
		finalData = await transactionData(filterRes)
		window.localStorage.setItem("finalData", JSON.stringify(finalData))
		setTableData(finalData);
	};

	// get row open url
	const getHash = async (transactionsInfo: FinalDataObject) => {
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
