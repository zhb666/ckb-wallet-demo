import React, { useEffect } from 'react';

import Navigation from '../Navigation/Navigation';
import { notification } from 'antd';
import './Header.scss';
import { get_peers } from "../../rpc/index"

function Component() {

	const getPeers = async () => {
		const res = await get_peers();
		if (!res.length) {
			notification["error"]({
				message: 'error',
				description:
					"Please configure peers",
			});
		}
	}

	useEffect(() => {
		getPeers()
	}, [])

	const html =
		(
			<header>
				<Navigation />
			</header>
		);

	return html;
}

export default Component;
