import React, { useState } from "react";
import banana from "../../resources/logo.svg";

const App = () => {
	const [txHash, setTxHash] = useState();
	const handleSubmit = (e) => {
		e.preventDefault();
	};

	return (
		<React.Fragment>
			<div className="container">
				<div className="heading">fancyBanana (FBNNA) faucet</div>
				<img className="logo" src={banana} alt="logo img" />
				{txHash && (
					<span>
						Go to transaction: <a href={`https://sepolia.etherscan.io/tx/${txHash}`}>Here</a>
					</span>
				)}
				<form className="key-form" onSubmit={(e) => handleSubmit(e)}>
					<input name="key" placeholder="Enter account address for free tokens:" />
					<button>Drink</button>
				</form>
				<span>
					Contract addr: {}
					<a href="https://sepolia.etherscan.io/token/0x4545761717e1aeb030c99e178968e08a4ce27b10">
						0x4545761717e1aeb030c99e178968e08a4ce27b10
					</a>
				</span>
				<div className="refill"></div>
			</div>
		</React.Fragment>
	);
};

export default App;
