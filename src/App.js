import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import pregImage from './preg.jpg';
//import { loadContract } from './utils/load-contract';
import './App.css';
const CrowdfundingABI = [
  {
    "stateMutability": "payable",
    "type": "receive",
    "payable": true
  },
  {
    "inputs": [],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "returnFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const CHAIN_ID = 3; // Ropsten Network ID
const CROWDFUNDING_CONTRACT_ADDRESS = '0x56c0D672aF06e3f4FBcC3C78a268aD12091859a2';

const App = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [account, setAccount] = useState();
  const [web3, setWeb3] = useState();
  const [crowdfundingContractInstance, setCrowdfundingContractInstance] = useState();
  const [responseMessage, setResponseMessage] = useState();

  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      setWeb3(web3);

      const crowdfundingContract = new web3.eth.Contract(
        CrowdfundingABI,
        CROWDFUNDING_CONTRACT_ADDRESS
      );
      setCrowdfundingContractInstance(crowdfundingContract);
    }
  }, []);


  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) {
      alert(
        'No ethereum object found. Please install MetaMask or similar wallet extension.'
      );
      return;
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts.length) {
      console.log('No authorized account found');
      return;
    }

    if (accounts.length) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setAccount(account);

      const networkId = await web3.eth.net.getId();
      if (networkId !== CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x3' }],
          });
          console.log('Successfully switched to Ropsten Network');
        } catch (error) {
          console.error(error);
        }
      }
    }

    setIsWalletConnected(true);
  };

  const donateETH = async () => {
    if (!account || !window.ethereum) {
      console.log('Wallet is not connected');
      return;
    }

    const donationAmount = document.querySelector('#donationAmount').value;

    if (!donationAmount || isNaN(donationAmount) || donationAmount <= 0) {
      alert('Invalid donation amount. Please enter a valid number.');
      return;
    }

    try {
      const response = await crowdfundingContractInstance.methods.donate().send({
        from: account,
        value: web3.utils.toWei(donationAmount, 'ether'),
      });

      if (response.status) {
        setResponseMessage('Donation successful! Thank you for your support.');
      } else {
        setResponseMessage('Donation failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setResponseMessage('Donation failed. Please try again.');
    }
  };
  return (
    <div className="app">
      <header>
        <img src={pregImage} alt="Crowdfunding project banner" />
        <h1>Pregwipe</h1>
        <h2>Let's help save lives</h2>
        <p>One in five pregnant women arrive at the hospital when their amniotic fluid has actually dropped.</p>
        <p>The majority of the population is unable to differentiate between amniotic fluid loss and other fluids.</p>
        <p> We are developing a wipe that will identify by a chemical reaction whether it is indeed water loss.</p>
        <h2><b>Join and contribute to our project !!</b></h2>
      </header>
    {isWalletConnected ? (
        <>
          <p>Connected Account: {account}</p>
          <div>
            <input
              type="number"
              id="donationAmount"
              placeholder="Donation Amount in Ether"
            />
            <button onClick={donateETH}>Donate</button>
          </div>
          <p>{responseMessage}</p>
        </>
      ) : (
        <button onClick={checkIfWalletIsConnected}>Connect Wallet</button>
      )}
    </div>
  );
};

export default App;