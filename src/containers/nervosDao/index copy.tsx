import React, { useEffect, useState } from "react";
import {
	deposit,
	logDepositEpoch,
	starWithdrawing,
	logStartWithdrawingEpoch,
	logCurrentEpoch,
	withdraw,
} from "../../wallet/dao";
import { get_cells } from "../../rpc"

import { getUnlockableAmountsFromCells } from "./lib"

import "./index.scss";

const Component: React.FC = () => {

	const getUnlockableAmounts = async () => {

		const cells = await get_cells({
			"code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
			"hash_type": "type",
			"args": "0x2760d76d61cafcfc1a83d9d3d6b70c36fa9d4b1a"
		})

		const res = await getUnlockableAmountsFromCells(cells.objects)

		console.log(res, "res____");

	}


	return (
		<main className="dao">
			{/* <div>
				<button onClick={deposit}>deposit:106 ckb</button>
			</div> */}
			<div>
				<button onClick={logDepositEpoch}>logDepositEpoch</button>
			</div>
			<div>
				<button onClick={starWithdrawing}>starWithdrawing </button>
			</div>
			<div>
				<button onClick={logStartWithdrawingEpoch}>logStartWithdrawingEpoch</button>
			</div>
			<div>
				<button onClick={logCurrentEpoch}>logCurrentEpoch</button>
			</div>
			<div>
				<button onClick={withdraw}>withdraw</button>
			</div>

			<div>
				<button onClick={getUnlockableAmounts}>getUnlockableAmountsFromCells</button>
			</div>
		</main>
	);
};

export default Component;
