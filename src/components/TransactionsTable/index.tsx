import React, { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/lib/table';
import { Space, Table, Button } from 'antd';

import {
	get_transactions
} from "../../rpc";
import './index.scss';


interface DataType {
	key: string;
	id: string | number;
	type: string;
	hash: string | number;
}

const columns: ColumnsType<DataType> = [
	{
		title: 'ID',
		dataIndex: 'id',
		key: 'id'
	},
	{
		title: 'Type',
		dataIndex: 'type',
		key: 'type',
	},
	{
		title: 'Hash',
		dataIndex: 'hash',
		key: 'hash',

	},
	{
		title: 'View Transactions',
		key: 'hash',
		render: (_, record) => (
			<Space size="middle">
				<a>{record.hash}</a>
			</Space>
		),
	},
];

const data: DataType[] = [
	{
		id: 1,
		key: '1',
		hash: "11111111",
		type: "pending"
	},
	{
		id: 2,
		key: '2',
		hash: "11111111",
		type: "pending"
	},
	{
		id: 3,
		key: '3',
		hash: "11111111",
		type: "pending"
	},
];


const TransactionsTable: React.FC = () => {

	const [tableData, setTableData] = useState<any>()

	// get table data
	const getTableData = async () => {
		const res = await get_transactions();
		if (res) setTableData(res);
	};

	useEffect(() => {
		getTableData()
	}, [])


	return (
		<div className='transactionsTable'>
			<Table columns={columns} pagination={false} dataSource={data} />
			<Button className='button' type="primary">next</Button>
		</div>
	)
}

export default TransactionsTable;
