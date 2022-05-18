import React, { useEffect, useState } from "react";
import { A } from "hookrouter";
import { setScripts, getScripts, get_cells, get_transactions, get_cells_capacity } from '../../rpc';
import { getCapacity } from "../../utils"
import { div } from "../../utils/bigNumber"

import "./index.scss";


const Component: React.FC = () => {
	const [balance, setBalance] = useState<any>(0);

	async function getBalance() {

		let capacity = await get_cells_capacity()

		let balance = div(await getCapacity(capacity), 8)
		setBalance(balance.toString())
	}

	return (
		<main className="home">
			<p><button onClick={setScripts}>setScripts</button></p>
			<p><button onClick={getScripts}>getScripts</button></p>
			<p><button onClick={get_cells}>get_cells</button></p>
			<p><button onClick={get_transactions}>get_transactions</button></p>
			<p><button onClick={getBalance}>get_cells_capacity:</button> {balance} ckb</p>
		</main>
	);
};

export default Component;
