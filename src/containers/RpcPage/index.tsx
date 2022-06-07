import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import {
	setScripts,
	getScripts,
	get_cells,
	get_transactions,
	get_cells_capacity
} from "../../rpc";
import { getCapacity } from "../../utils";
import { div } from "../../utils/bigNumber";

import "./index.scss";

const Component: React.FC = () => {
	const [balance, setBalance] = useState<any>(0);
	const [cells, setCells] = useState<any>({});
	const [transactions, setTransactions] = useState<any>({});

	async function getBalance() {
		let capacity = await get_cells_capacity();
		let balance = div(await getCapacity(capacity), 8);
		setBalance(balance.toString());
	}

	async function getCells() {
		let cells = await get_cells();
		setCells(cells);
	}

	async function getTransactions() {
		let transactions = await get_transactions();
		setTransactions(transactions);
	}

	return (
		<main className="rpc">
			<div>
				<button onClick={setScripts}>setScripts</button>
			</div>
			<div>
				<button onClick={getScripts}>getScripts</button>
			</div>
			<div>
				<button onClick={getCells}>get_cells </button>
				<ReactJson theme={"tomorrow"} src={cells} />
			</div>
			<div>
				<button onClick={getTransactions}>get_transactions</button>
				<ReactJson theme={"tomorrow"} src={transactions} />
			</div>
			<div>
				<button onClick={getBalance}>get_cells_capacity</button> : {balance} ckb
			</div>
			<div>
				<button onClick={async () => {
					const num = await (await getCapacity("0x18127bd4e37")).toString();
					console.log(num)
				}}>BI.from</button>
			</div>
		</main>
	);
};

export default Component;
