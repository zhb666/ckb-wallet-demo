import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import {
	setScripts,
	getScripts,
	get_cells,
	get_transactions,
	get_cells_capacity,
	getTipHeader,
	get_transaction
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
				<button onClick={getTipHeader}>getTipHeader</button>
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
				<button onClick={async () => {
					const res = await get_transaction("0x40353df3099510d4103086db369a8e87560d4db224ad88dffc22ea32b2317809")
					console.log(res);

				}}>get_transaction</button>
			</div>
			<div>
				<button onClick={() => {
					get_transaction("0x8066ecb37a2fb3e990957a8ce7d51028a75c464715490b0a57ce8ea244991eb3")
				}}>get_transaction</button>
			</div>
			<div>
				<button onClick={() => {
					get_transaction("0x9a89e7137f467c2df54d9ee03c8522ad4aa210f82a3114b7832acf3be30b6c4d")
				}}>get_transaction</button>
			</div>
			<div>
				<button onClick={getCells}>get_cells </button>
				<ReactJson theme={"tomorrow"} src={cells} />
			</div>
			<div>
				<button onClick={getBalance}>get_cells_capacity</button> : {balance} ckb
			</div>
			<div>
				<button onClick={async () => {
					const num = await (await getCapacity("0x2186f9360")).toString();
					console.log(num)
				}}>BI.from</button>
			</div>
			<div>
				<button onClick={async () => {
					const num = await (await getCapacity("0x2540a5d60")).toString();
					console.log(num)
				}}>BI.from</button>
			</div>
			<div>
				<button onClick={async () => {
					const num = await (await getCapacity("0xa54f4ab560")).toString();
					console.log(num)
				}}>BI.from</button>
			</div>
		</main>
	);
};


export default Component;

