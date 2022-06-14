import React from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ModalContainer } from 'reoverlay';
import App from './containers/App/App';
import Progress from "./components/Progress";


import 'reoverlay/lib/ModalWrapper.css';
import "./index.scss";


async function Main() {




	const html =
		(
			<div className='main'>
				{/* <React.StrictMode> */}
				<App />
				<ToastContainer />
				<ModalContainer />
				<div className='progress'>
					<Progress />
				</div>
				{/* </React.StrictMode> */}
			</div>
		);
	ReactDOM.render(html, document.getElementById('root'));
}
Main();

// import reportWebVitals from './reportWebVitals';
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
