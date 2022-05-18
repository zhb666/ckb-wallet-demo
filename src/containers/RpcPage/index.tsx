import React, { useEffect, useState } from "react";
import { A } from "hookrouter";
import ReactJson from 'react-json-view'
import { setScripts, getScripts, get_cells, get_transactions, get_cells_capacity } from '../../rpc';
import { getCapacity } from "../../utils"
import { div } from "../../utils/bigNumber"

import "./index.scss";


const Component: React.FC = () => {
	const [balance, setBalance] = useState<any>(0);
	const [cells, setCells] = useState<any>({});
	const [transactions, setTransactions] = useState<any>({});

	async function getBalance() {
		let capacity = await get_cells_capacity()
		let balance = div(await getCapacity(capacity), 8)
		setBalance(balance.toString())
	}

	async function getCells() {
		let cells = await get_cells()
		setCells(cells)
	}

	async function getTransactions() {
		let transactions = await get_transactions()
		setTransactions(transactions)
	}

	return (
		<main className="home">
			<p><button onClick={setScripts}>setScripts</button></p>
			<p><button onClick={getScripts}>getScripts</button></p>
			<p>
				<button onClick={getCells}>get_cells </button>
				<ReactJson theme={"tomorrow"} src={cells} />
			</p>
			<p>
				<button onClick={getTransactions}>get_transactions</button>
				<ReactJson theme={"tomorrow"} src={transactions} />
			</p>
			<p><button onClick={getBalance}>get_cells_capacity</button> : {balance} ckb</p>
		</main>
	);
};

export default Component;
