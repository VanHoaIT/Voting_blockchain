import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import * as Contract from '../service/service';
import Navbar from '../components/Navbar'; // Import Navbar component
import stylesP from '../styles/Page.module.css';
import styles from '../styles/MyComponent.module.css';

function Page() {

  const [tokenAddressInput, setTokenAddressInput] = useState('');//thêm token
  const [tokenList, setTokenList] = useState([]); // Danh sách token
  const [tokenPrices, setTokenPrices] = useState({}); // Giá của các token
  const [priceInput, setPriceInput] = useState(''); // Giá nhập vào
  const [approveAmounts, setApproveAmounts] = useState({}); // Số lượng token cần ủy quyền
  const [account, setAccount] = useState(null); // Tài khoản hiện tại
  

  useEffect(() => {
    // Gọi hàm `getTokenList` khi trang được tải
    getTokenList();
    loadAccount();
  }, []);

  const handleAddToken = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const exchangeContract = new web3.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
      const account = (await web3.eth.getAccounts())[0];
      await exchangeContract.methods.addToken(tokenAddressInput).send({ from: account });
      alert(`Đã thêm thành công token vào sàn`);
      getTokenList();
    } catch (error) {
      console.error("Error adding token:", error);
    }
  };

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

  const getTokenList = async () => {
    try {
      // Thực hiện các thao tác cần thiết để lấy danh sách token
      // Ví dụ: Gọi hàm `getTokenList` từ hợp đồng Exchange
      const web3 = new Web3(window.ethereum);
      const exchangeContract = new web3.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
      const tokens = await exchangeContract.methods.getTokenList().call();
      setTokenList(tokens);
      getTokensPrice(tokens); // Gọi hàm để lấy giá của các token
    } catch (error) {
      console.error('Error getting token list:', error);
    }
  };

  const getTokensPrice = async (tokens) => {
    try {
      const prices = {};
      for (let token of tokens) {
        const web3 = new Web3(window.ethereum);
        const exchangeContract = new web3.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
        const price = await exchangeContract.methods.getTokenPrice(token).call();
        prices[token] = price;
      }
      setTokenPrices(prices);
    } catch (error) {
      console.error('Error getting token prices:', error);
    }
  };

  const handleSetTokenPrice = async (tokenAddress) => {
    try {
      const web3 = new Web3(window.ethereum);
      const exchangeContract = new web3.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
      const owner = await exchangeContract.methods.owner().call();
      if (account !== owner) {
        alert('Bạn không có quyền thực hiện hành động này.');
        return;
      }
      await exchangeContract.methods.setTokenPrice(tokenAddress, priceInput).send({ from: account });
      alert(`Đã đặt giá token thành công`);
      getTokenList(); // Cập nhật giá token sau khi đặt
    } catch (error) {
      console.error("Error setting token price:", error);
    }
  };

  const handleApproveToken = async (tokenAddress, amount) => {
    try {
      const web3 = new Web3(window.ethereum);
      const tokenContract = new web3.eth.Contract(Contract.ERC20ABI, tokenAddress);
      await tokenContract.methods.approve(Contract.ExchangeAddress, amount).send({ from: account });
      alert('Đã ủy quyền thành công');
    } catch (error) {
      console.error("Error approving token:", error);
    }
  };

  return (
    <div className={styles.Page}>
      <Navbar />
      <div className={styles.h2}>
        <h1>Page</h1>
        <div className={styles.addToken}>
          <input
            type="text" 
            placeholder="Enter Token Address" 
            value={tokenAddressInput} 
            onChange={(e) => setTokenAddressInput(e.target.value)} 
          />
          <button onClick={handleAddToken}>Add Token</button>
        </div>
        <div className={styles.tokenList}>
          <h2>Token List:</h2>
          <ul>
            {tokenList.map((token, index) => (
              <li key={index}>
                {`${token}: ${tokenPrices[token] ? parseFloat(tokenPrices[token]).toFixed(1) : 'Chưa được định giá'}`}
                <input className={styles.getnumber}
                  type="number"
                  placeholder="Enter Price"
                  value={priceInput}
                  onChange={(e) => {
                    setPriceInput(e.target.value)
                  }}
                />
                <button className={styles.buttonInput} onClick={() => handleSetTokenPrice(token)}>
                  Set Price
                </button>
                <input
                  type="number" className={styles.getnumber}
                  placeholder="Enter Amount"
                  value={approveAmounts[token] || ''}
                  onChange={(e) => {
                    const newApproveAmounts = { ...approveAmounts };
                    newApproveAmounts[token] = e.target.value;
                    setApproveAmounts(newApproveAmounts);
                  }}
                />
                <button className={styles.buttonInput} onClick={() => handleApproveToken(token, approveAmounts[token])}>
                  Approve
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Page;
