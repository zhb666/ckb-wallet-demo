import React, { useEffect, useState } from "react";
import {
	deposit,
	logDepositEpoch,
	starWithdrawing,
	logStartWithdrawingEpoch,
	logCurrentEpoch,
	withdraw,
	getTest
} from "../../wallet/dao";

import "./index.scss";

const Component: React.FC = () => {


	return (
		<main className="dao">
			<div>
				<button onClick={deposit}>deposit</button>
			</div>
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
				<button onClick={getTest}>getTest</button>
			</div>
		</main>
	);
};

export default Component;