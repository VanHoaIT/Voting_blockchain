// pages/history.js

import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import * as Contract from '../service/service';
import Navbar from '../components/Navbar';

import styles from '../styles/MyComponent.module.css';

const History = () => {
  const [account, setAccount] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);

  useEffect(() => {
    loadAccount();
    fetchTradeHistory();
  }, []);

  const loadAccount = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error('Error loading account:', error);
    }
  };

  const fetchTradeHistory = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const exchangeContract = new web3.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
      const result = await exchangeContract.methods.getTradeHistory().call();
      const formattedHistory = result.buyers.map((buyer, index) => ({
        buyer: buyer,
        seller: result.sellers[index],
        tokenAmount: result.tokenAmounts[index].toString(),
        lkkPrice: result.lkkPrices[index].toString(),
        tokenAddress: result.tokenAddresses[index],
        timestamp: new Date(Number(result.timestamps[index]) * 1000).toLocaleString(),
      }));
      setTradeHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching trade history:', error);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar userAddress={account}/>
      <div className={styles.container}>

        <h1>Trade History</h1>

        <div className={styles.tableContainer}>
            <h2 className={styles.title}>History Trades</h2>
            <table className={styles.tradeTable}>
            <thead>
                <tr>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Token Amount</th>
                <th>LKK Price</th>
                <th>Token Address</th>
                <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                {tradeHistory.map((trade, index) => (
                    <tr key={index}>
                    <td>{trade.buyer}</td>
                    <td>{trade.seller}</td>
                    <td>{trade.tokenAmount}</td>
                    <td>{trade.lkkPrice}</td>
                    <td>{trade.tokenAddress}</td>
                    <td>{trade.timestamp}</td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>

      </div>
    </div>
  );
};

export default History;
