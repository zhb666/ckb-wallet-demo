import { useRoutes } from 'hookrouter';

import './App.scss';
import About from '../About/About';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import Home from '../Home/Home';
import Secp256k1Transfer from '../Secp256k1Transfer/index';
import TransferDemo2 from '../Transfer-demo2/index';
import RPCPAGE from '../RpcPage/index';
import Dao from '../nervosDao/index';

const routes =
{
	'/': () => <Home />,
	'/about': () => <About />,
	'/transfer-demo1': () => <Secp256k1Transfer />,
	'/transfer-demo2': () => <TransferDemo2 />,
	'/rpc-page': () => <RPCPAGE />,
	'/dao': () => <Dao />,
};

function App() {
	const routeResult = useRoutes(routes);

	let html =
		(
			<>
				<Header />
				<section className="main">
					{routeResult}
				</section>
				<Footer />
			</>
		);

	return html;
}

export default App;
