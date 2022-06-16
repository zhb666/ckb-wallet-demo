import React, { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/lib/table';
import { Space, Table, Button } from 'antd';
import { IndexerTransaction } from "../../service/type"

import {
	get_transactions
} from "../../rpc";
import './index.scss';



// interface DataType {
// 	key: string;
// 	id: string | number;
// 	type: string;
// 	hash: string | number;
// }

const columns: ColumnsType<IndexerTransaction> = [
	{
		title: 'ID',
		render: (text, record, index) => `${index + 1}`,
	},
	{
		title: 'Type',
		dataIndex: 'io_type',
		key: 'io_type',
	},
	{
		title: 'View Transactions',
		key: 'tx_index',
		render: (_, record) => (
			<Space size="middle">
				<a>{record.transaction.hash}</a>
			</Space>
		),
	},
];

const data: IndexerTransaction[] = [

];


const TransactionsTable: React.FC = () => {

	const [tableData, setTableData] = useState<IndexerTransaction[]>(data)
	const [lastCursor, setLastCursor] = useState<string>('')

	// get table data
	const getTableData = async () => {
		const res = await get_transactions(lastCursor);
		console.log(res, "res____")
		if (res && res.objects) setTableData(res.objects);
		setLastCursor(res.lastCursor)
	};

	useEffect(() => {
		getTableData()
	}, [])


	return (
		// rowKey={columns => columns.io_type
		<div className='transactionsTable'>
			<Table columns={columns} pagination={false} dataSource={tableData} />
			<Button className='button' type="primary">next</Button>
		</div>
	)
}

export default TransactionsTable;
