import React, { useEffect, useState } from "react";
import { A } from "hookrouter";
import { setScripts, getScripts, get_cells, get_transactions, get_cells_capacity } from '../../rpc';
import "./index.scss";



const Component: React.FC = () => {

	return (
		<main className="home">
			<p><button onClick={setScripts}>setScripts</button></p>
			<p><button onClick={getScripts}>getScripts</button></p>
			<p><button onClick={get_cells}>get_cells</button></p>
			<p><button onClick={get_transactions}>get_transactions</button></p>
			<p><button onClick={get_cells_capacity}>get_cells_capacity</button></p>
		</main>
	);
};

export default Component;
