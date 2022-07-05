import React, { useState } from 'react';
import { A, usePath } from 'hookrouter';
import './Navigation.scss';

function Component() {
	const currentPath = usePath();
	const [isMenuActive, setMenuActive] = useState(false);

	const toggleMenu = (e: React.SyntheticEvent) => {
		// Match the backdrop height to the visible content container.
		const main = document.querySelector('section.main') as HTMLElement;
		const backdrop = document.querySelector('div.menu3-backdrop') as HTMLElement;
		const contentHeight = Math.max(main.offsetHeight, window.innerHeight);
		backdrop.style.height = contentHeight + 'px';

		// Toggle the menu active state.
		setMenuActive(!isMenuActive);
	}

	const html =
		(
			<nav className="primary">
				<div className="background">&nbsp;</div>
				<div className="logo"><A href="/">ckb-wallet-demo<small></small></A></div>
				<ul className="menu1">
					<li><A href="/" className={(currentPath === '/') ? 'active' : ''} title="Create Wallet">Create—Wallet</A></li>
					{/* <li><A href="/transfer-demo1" className={(currentPath === '/transfer-demo1') ? 'active' : ''} title="transfer">Tsransfer-Demo1</A></li> */}
					<li><A href="/send" className={(currentPath === '/send') ? 'active' : ''} title="Send">Send</A></li>
					{/* <li><A href="/rpc-page" className={(currentPath === '/rpc-page') ? 'active' : ''} title="rpc-page">Rpc-Page</A></li> */}
					<li><A href="/dao" className={(currentPath === '/dao') ? 'active' : ''} title="rpc-page">Nervos-Dao</A></li>
				</ul>
				<ul className="menu2">
					<li><A href="/about" className={(currentPath === '/about') ? 'active' : ''} title="About"><i className="fas fa-info-circle"></i></A></li>
					<li><a href="https://github.com/zhb666/ckb-wallet-demo" target="_blank" rel="noreferrer" title="GitHub"><i className="fab fa-github"></i></a></li>
				</ul>
				<button className="hamburger" onClick={toggleMenu}><i className="fas fa-bars"></i></button>
				<div className={"menu3-backdrop" + ((isMenuActive) ? ' active' : '')} onClick={toggleMenu}>&nbsp;</div>
				<ul className={"menu3" + ((isMenuActive) ? ' active' : '')}>
					<li><A href="/" className={(currentPath === '/') ? 'active' : ''} title="Create Wallet" onClick={toggleMenu}>Create—Wallet</A></li>
					<li><A href="/about" className={(currentPath === '/about') ? 'active' : ''} title="About" onClick={toggleMenu}>About</A></li>
					{/* <li><A href="/transfer-demo1" className={(currentPath === '/secp256k1Transfer') ? 'active' : ''} title="transfer">Tsransfer-Demo1</A></li> */}
					<li><A href="/send" className={(currentPath === '/send') ? 'active' : ''} title="Send">Send</A></li>
					<li><A href="/rpc-page" className={(currentPath === '/rpc-page') ? 'active' : ''} title="rpc-page">Rpc-Page</A></li>
					<li><a href="https://github.com/zhb666/ckb-wallet-demo" target="_blank" rel="noreferrer" title="GitHub" onClick={toggleMenu}>GitHub</a></li>
					{/* <li><A href="/dao" className={(currentPath === '/dao') ? 'active' : ''} title="rpc-page">Nervos-Dao</A></li> */}
				</ul>
			</nav>
		);

	return html;
}

export default Component;
