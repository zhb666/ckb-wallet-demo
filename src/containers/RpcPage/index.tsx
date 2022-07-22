import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import {
	setScripts,
	getScripts,
	get_cells,
	get_transactions,
	get_cells_capacity,
	getTipHeader,
	get_transaction,
	get_header
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

	// async function getTransactions() {
	// 	let transactions = await get_transactions();
	// 	setTransactions(transactions);
	// }

	return (
		<main className="rpc">
			<div>
				<button onClick={() => {
					setScripts({
						"code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
						"hash_type": "type",
						"args": "0x2760d76d61cafcfc1a83d9d3d6b70c36fa9d4b1a"
					}, "0x0")
				}}>setScripts</button>
			</div>

			<div>
				<button onClick={getTipHeader}>getTipHeader</button>
			</div>
			<div>
				<button onClick={getCells}>get_cells </button>
				<ReactJson theme={"tomorrow"} src={cells} />
			</div>
			{/* <div>
				<button onClick={getTransactions}>get_transactions</button>
				<ReactJson theme={"tomorrow"} src={transactions} />
			</div> */}
			<div>
				<button onClick={async () => {
					const res = await get_transaction("0xa2692a00465d619b00660f4907be5bd1175593c85b486b6e56f5c983884e11a1")
					console.log(res);

				}}>get_transaction</button>
			</div>
			<div>
				<button onClick={() => {
					get_transaction("0xa2692a00465d619b00660f4907be5bd1175593c85b486b6e56f5c983884e11a1")
				}}>get_transaction</button>
			</div>
			<div>
				<button onClick={() => {
					get_transaction("0x9a89e7137f467c2df54d9ee03c8522ad4aa210f82a3114b7832acf3be30b6c4d")
				}}>get_transaction</button>
			</div>
			<div>
				<button onClick={() => {
					get_header("0x1b4e1f981faff42a4145c941994cb1c53a4a3a314fb2f9deb8caafe775164d0e")
				}}>get_header</button>
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

