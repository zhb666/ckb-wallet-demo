import { useRoutes } from 'hookrouter';

import About from '../About/About';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import Home from '../Home/Home';
import Transfer from '../Transfer/index';
import RPCPAGE from '../RpcPage/index';
import Dao from '../nervosDao/index';
import Receive from '../Receive/index';

import './App.scss';
import 'antd/dist/antd.css';

const routes =
{
	'/': () => <Home />,
	'/about': () => <About />,
	'/send': () => <Transfer />,
	'/rpc-page': () => <RPCPAGE />,
	'/dao': () => <Dao />,
	'/receive': () => <Receive />,
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
