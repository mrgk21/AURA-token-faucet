import React, { useState, useEffect } from "react";
import Web3 from "web3";
// import banana from "../../resources/logo3.jpg";
import toast, { Toaster } from "react-hot-toast";

let web3;
const tokensPerRequest = 1000;
const gasLimit = 60000;
const baseFee = 1.8;
const priorityFee = baseFee;
const tokenAddress = "0x37e97312DFbF16dEB489875751a2B982aA17b2cF";
const adminAddress = "0x54fCe65792cbC7ad71c7220D6461D023A4d413a6";

const App = () => {
	const [txHash, setTxHash] = useState("");
	const [accounts, setAccounts] = useState([]);

	const [faucetLimit, setFaucetLimit] = useState(0);
	const [ownerBalance, setOwnerBalance] = useState(-1);
	const [adminAccess, setAdminAccess] = useState(false);

	const errorMsgHandler = (err) => {
		toast.error(`Error ${err.code}: ${err.message}`);
	};

	const dataStringBuilder = (func, funcCount, ...params) => {
		let data = [web3.utils.sha3(func).substring(0, 10)];
		if (!funcCount) return data.join("");

		for (let i = 0; i < funcCount; i++) {
			if (typeof params[i] == "number") data.push(Number(params[i]).toString(16).padStart(64, "0"));
			if (typeof params[i] == "string") data.push(params[i].substring(2).padStart(64, "0"));
		}
		console.log(func, data);
		return data.join("");
	};

	const { ethereum } = window;
	useEffect(() => {
		if (ethereum !== undefined) {
			web3 = new Web3(ethereum);
			ethereum.on("accountsChanged", (acc) => {
				setAccounts(acc);
				setAdminAccess(acc.includes(adminAddress.toLowerCase()));
			});
			ethereum
				.request({ method: "eth_accounts" })
				.then((acc) => {
					toast.success("Metamask connected");
					setAccounts(acc);
					setAdminAccess(acc.includes(adminAddress.toLowerCase()));
				})
				.catch(errorMsgHandler);

			const txObj = {
				to: tokenAddress,
				chainId: "0xaa36a7",
			};

			ethereum
				.request({ method: "eth_call", params: [{ ...txObj, data: dataStringBuilder("_faucetLimit()", 0) }] })
				.then((res) => setFaucetLimit(Number(res).toString(10)))
				.catch(errorMsgHandler);

			ethereum
				.request({
					method: "eth_call",
					params: [{ ...txObj, data: dataStringBuilder("balanceOf(address)", 1, adminAddress) }],
				})
				.then((res) => setOwnerBalance(Number(res).toString(10)))
				.catch(errorMsgHandler);
		}
	}, []);

	const handleFaucetProperties = async (options = {}) => {
		const { refillAmount } = options;

		const obj = {
			from: accounts[0],
			to: tokenAddress,
			data: dataStringBuilder("refillFaucet(uint256)", 1, refillAmount),
			gasLimit: Number(gasLimit).toString(16),
			maxFeePerGas: Number(web3.utils.toWei(String(baseFee), "gwei")).toString(16),
			maxPriorityFeePerGas: Number(web3.utils.toWei(String(priorityFee), "gwei")).toString(16),
			chainId: "0xaa36a7",
		};

		await ethereum.request({ method: "eth_sendTransaction", params: [obj] }).catch(errorMsgHandler);

		obj.data = dataStringBuilder("balanceOf(address)", 1, adminAddress);

		const bal = await ethereum.request({ method: "eth_call", params: [obj] }).catch(errorMsgHandler);
		setOwnerBalance(Number(bal).toString(10));
	};

	const handleMetamaskConnect = async () => {
		ethereum.request({ method: "eth_requestAccounts" }).then(setAccounts).catch(errorMsgHandler);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const { target } = e;
		const userIP = await (await fetch("https://geolocation-db.com/json/")).json();
		const localUserIP = localStorage.getItem(userIP.IPv4);

		let remainingTime;
		if (!localUserIP) remainingTime = 0;
		else remainingTime = localUserIP - Date.now();

		let txObj;
		if (remainingTime <= 0) {
			const data = [
				web3.utils.sha3("faucet(uint256)").substring(0, 10),
				Number(tokensPerRequest).toString(16).padStart(64, "0"), //param1
			];

			txObj = {
				from: target["key"].value,
				to: tokenAddress, //fancy banana smart contract
				maxFeePerGas: Number(web3.utils.toWei(String(baseFee), "gwei")).toString(16),
				maxPriorityFeePerGas: Number(web3.utils.toWei(String(priorityFee), "gwei")).toString(16),
				gasLimit: Number(gasLimit).toString(16),
				data: data.join(""),
				chainId: "0xaa36a7", //sepolia chain
			};
			console.log(txObj);

			ethereum
				.request({ method: "eth_sendTransaction", params: [txObj] })
				.then((res) => {
					//optimistic update (poll to tx hash at a later commit)
					localStorage.setItem(String(userIP.IPv4), Date.now() + 1000 * 60 * 60 * 6); //6 hours limit
					setTxHash(res);
				})
				.catch(errorMsgHandler);

			return;
		}
		errorMsgHandler({ code: 400, message: `Try again on ${new Date(Number(localUserIP))}` });
	};

	return (
		<React.Fragment>
			<div className="container">
				<div className="heading">Aurora Token (AURA) faucet</div>
				{/* <img className="logo" src={banana} alt="logo img" /> */}
				{txHash && (
					<span>
						Go to transaction:{" "}
						<a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank">
							Here
						</a>
					</span>
				)}
				{!accounts[0] && (
					<button name="metamask-connect" onClick={handleMetamaskConnect}>
						Connect to metamask
					</button>
				)}
				{adminAccess && (
					<div>
						<span>Faucet Limit: {faucetLimit}</span>
						<span>Owner balance: {ownerBalance}</span>
						<button
							name="faucet-properties"
							onClick={() => handleFaucetProperties({ refillAmount: 1500000 })}
						>
							Add 1500000 tokens to faucet
						</button>
					</div>
				)}
				<form className="key-form" onSubmit={(e) => handleSubmit(e)}>
					<input name="key" placeholder="Enter account address for free tokens:" />
					<button>Drink</button>
				</form>
				<span>
					Current rate: <strong>1000 tokens per use</strong>
				</span>
				<span>
					Contract addr: {}
					<a href={`https://sepolia.etherscan.io/token/${tokenAddress}`} target="_blank">
						{tokenAddress}
					</a>
				</span>
				<span>
					Dont have enough SepoliaETH? Try{" "}
					<a href="https://faucet.sepolia.dev/" target="_blank">
						Here
					</a>
				</span>
				<span className="disclaimer">
					Unfortunately sepolia testnet does not support metamask mobile. Check{" "}
					<a href="https://github.com/MetaMask/metamask-mobile/issues/5259">here</a> for updates.
				</span>
				<Toaster position="top-left" toastOptions={{ className: "toast" }} />
			</div>
		</React.Fragment>
	);
};

export default App;
