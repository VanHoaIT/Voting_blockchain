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
  const [tradeResults, setTradeResults] = useState({ //tìm kiếm
    tradeIds: [],
    sellers: [],
    tokenAmounts: [],
    lkkPrices: []
  });
  
  useEffect(() => {
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

  const findTradesByToken = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const exchangeContract = new web3.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
      const result = await exchangeContract.methods.findTradesByToken(tokenAddressInput).call();
      const formattedResults = {
        tradeIds: result.tradeIds.map(id => id.toString()),
        sellers: result.sellers.map(seller => seller.toString()),
        tokenAmounts: result.tokenAmounts.map(amount => amount.toString()),
        lkkPrices: result.lkkPrices.map(price => price.toString())
      };
      setTradeResults(formattedResults);
    } catch (error) {
      console.error('Error finding trades by token:', error);
    }
  };

  return (
    <div className={styles.Page}>

      <Navbar userAddress={account}/>

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

        <div>
          <h2 className={styles.title}>Find Trades by Token</h2>
          <select className={styles.select} onChange={(e) => setTokenAddressInput(e.target.value)} value={tokenAddressInput}>
            <option value="" disabled>Select Token</option>
            {tokenList.map((token, index) => (
              <option key={index} value={token}>{token}</option>
            ))}
          </select>
          <button className={styles.button_2} onClick={findTradesByToken}>Find Trades by Token</button>
          <div className={styles.tradeResults}>
            <h2 className={styles.title}>Trade Results</h2>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Trade ID</th>
                    <th>Seller</th>
                    <th>Token Amount</th>
                    <th>LKK Price</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeResults.tradeIds.map((tradeId, index) => (
                    <tr key={index}>
                      <td>{tradeId}</td>
                      <td>{tradeResults.sellers[index]}</td>
                      <td>{tradeResults.tokenAmounts[index]}</td>
                      <td>{tradeResults.lkkPrices[index]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default Page;
