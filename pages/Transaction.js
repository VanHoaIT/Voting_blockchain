// pages/transaction.js

import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import * as Contract from '../service/service';
import Navbar from '../components/Navbar';
import styles from '../styles/MyComponent.module.css';

function transaction(){
    const [account, setAccount] = useState(null); // Tài khoản hiện tại
    const [approveLKKAmount, setApproveLKKAmount] = useState(''); // Số lượng token LKK cần ủy quyền

    const [selectedToken, setSelectedToken] = useState(''); // Loại token được chọn
    const [tradeAmount, setTradeAmount] = useState(''); // Số lượng token muốn bán
    const [tokenList, setTokenList] = useState([]); // Danh sách token

    const [trades, setTrades] = useState([]); // Danh sách các giao dịch

    useEffect(() => {
        loadAccount();
        getTokenList();
        getTrades();
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

    //ủy quyền đồng trung gian LKK
    const handleApproveLKK = async () => {
        try {
          const web3 = new Web3(window.ethereum);
          const tokenContract = new web3.eth.Contract(Contract.ERC20ABI, Contract.LKKAddress);
          await tokenContract.methods.approve(Contract.ExchangeAddress, approveLKKAmount).send({ from: account });
          alert('Đã ủy quyền thành công');
        } catch (error) {
          console.error("Error approving LKK:", error);
        }
    };

    const getTokenList = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            const exchangeContract = new web3.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
            const tokens = await exchangeContract.methods.getTokenList().call();
            setTokenList(tokens);
        } catch (error) {
            console.error('Error getting token list:', error);
        }
    };

    const handleCreateTrade = async () => {
        try {
            if (!selectedToken || !tradeAmount) {
                alert('Vui lòng chọn token hoặc nhập số lượng để bán');
                return;
            }

            // Kiểm tra số lượng token đủ để bán hay không
            const web3 = new Web3(window.ethereum);
            const tokenContract = new web3.eth.Contract(Contract.ERC20ABI, selectedToken);
            const balance = await tokenContract.methods.balanceOf(account).call();
            if (parseFloat(tradeAmount) > parseFloat(balance)) {
                alert('Bạn không đủ token để bán');
                return;
            }
            // const web3 = new Web3(window.ethereum);
            const exchangeContract = new web3.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
            await exchangeContract.methods.createTrade(selectedToken, tradeAmount).send({ from: account });
            alert(`Đã tạo gói bán ${tradeAmount} token: ${selectedToken}`);
        } catch (error) {
            console.error("Error creating trade:", error);
        }
    };

    const getTrades = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            const exchangeContract = new web3.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
            const result = await exchangeContract.methods.getTrades().call();

            // Chuyển đổi các giá trị từ số nguyên sang chuỗi trước khi lưu vào state
            const formattedTrades = {
                tradeIds: result.tradeIds.map(id => id.toString()),
                sellers: result.sellers.map(seller => seller.toString()),
                tokenAmounts: result.tokenAmounts.map(amount => amount.toString()),
                lkkPrices: result.lkkPrices.map(price => price.toString()),
                tokenAddresses: result.tokenAddresses.map(address => address.toString())
            };

            setTrades(formattedTrades);
        } catch (error) {
            console.error('Error fetching trades:', error);
        }
    };

    const handleBuyTrade = async (tradeId) => {
        try {
            const web3 = new Web3(window.ethereum);
            const exchangeContract = new web3.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
            await exchangeContract.methods.buyTrade(tradeId).send({ from: account });
            alert(`Trade with ID ${tradeId} bought successfully`);
            // Sau khi mua thành công, cập nhật lại danh sách giao dịch
            const updatedTrades = trades.filter(trade => trade.tradeId !== tradeId);
            setTrades(updatedTrades);
        } catch (error) {
            console.error(`Error buying trade with ID ${tradeId}:`, error);
        }
    };

    const cancelTrade = async (tradeId) => {
        try {
            const web3 = new Web3(window.ethereum);
            const exchangeContract = new web3.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
            // Kiểm tra xem người dùng có phải là người bán không
            if (trades.sellers[tradeId] !== account) {
                alert('Bạn không có quyền hủy gói bán này.');
                return;
            }

            await exchangeContract.methods.cancelTrade(tradeId).send({ from: account });
            alert(`Trade with ID ${tradeId} cancelled successfully`);
            // Sau khi hủy thành công, cập nhật lại danh sách giao dịch
            const updatedTrades = trades.filter(trade => trade.tradeId !== tradeId);
            setTrades(updatedTrades);
        } catch (error) {
            console.error(`Error cancelling trade with ID ${tradeId}:`, error);
        }
    };
    
    return(
        <div>
            <Navbar userAddress={account}/>

            <div className={styles.approveLKK}>
                <h2 className={styles.title}>Approve LKK Token:</h2>
                <input className={styles.getnumber}
                type="number"
                placeholder="Enter Amount"
                value={approveLKKAmount}
                onChange={(e) => setApproveLKKAmount(e.target.value)}
                />
                <button className={styles.buttonInput} onClick={handleApproveLKK}>
                Approve LKK
                </button>
            </div>

            <div className={styles.createTrade}>
                <h2 className={styles.title}>Create Trade</h2>
                <select className={styles.select} onChange={(e) => setSelectedToken(e.target.value)} value={selectedToken}>
                    <option value="" disabled>Select Token</option>
                    {tokenList.map((token, index) => (
                        <option key={index} value={token}>
                            {token}
                        </option>
                    ))}
                </select>
                <input className={styles.getnumber}
                    type="number"
                    placeholder="Enter Amount"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                />
                <button className={styles.buttonInput} onClick={handleCreateTrade}>
                    Create Trade
                </button>
            </div>

            <div className={styles.listTrades}>
                <h2 className={styles.title}>List Trades</h2>
                <table className={styles.tradeTable}>
                    <thead>
                        <tr>
                            <th>Trade ID</th>
                            <th>Seller</th>
                            <th>Token Address</th>
                            <th>Token Amount</th>
                            <th>LKK Price</th>
                            <th>Mua</th>
                            <th>Hủy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(trades.tradeIds) && trades.tradeIds.length > 0 ? (
                        trades.tradeIds.map((tradeId, index) => (
                            <tr key={tradeId}>
                            <td>{tradeId}</td>
                            <td>{trades.sellers[index]}</td>
                            <td>{trades.tokenAddresses[index]}</td>
                            <td>{trades.tokenAmounts[index]}</td>
                            <td>{trades.lkkPrices[index]}</td>
                            <td><button onClick={() => handleBuyTrade(tradeId)}>Buy Trade</button></td>
                            <td><button onClick={() => cancelTrade(tradeId)}>Cancel Trade</button></td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan="7">No trades available</td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    )

}

export default transaction;