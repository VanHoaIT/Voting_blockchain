import { useEffect, useState } from 'react';
import Web3 from 'web3';
import * as Contract from '../service/service';
import Navbar from '../components/Navbar'; // Import Navbar component

import styles from '../styles/MyComponent.module.css';

const MyComponent = () => {
  const [contractInitialized, setContractInitialized] = useState(false); //kiểm tra SC đã thực thi chưa
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null); // Gán tài khoản đăng nhập 
  const [LKKContract, setLKKContract] = useState(null); // Gán hợp đồng tạo thành công
  const [exchangeContract, setExchangeContract] = useState(null); // Gán hợp đồng tạo thành công Exchange
  const [balance, setBalance] = useState(null); // Thêm trạng thái balance để lưu số dư
  const [approveLKKAmount, setApproveLKKAmount] = useState(''); // Số lượng token LKK cần ủy quyền
  const [tokenAddressInput, setTokenAddressInput] = useState(''); // Trường nhập liệu cho địa chỉ token muốn thêm vào
  const [tokenList, setTokenList] = useState([]); //danh sách token
  const [tokenPrices, setTokenPrices] = useState({}); //giá các token
  const [priceInput, setPriceInput] = useState(''); // Trường nhập liệu cho giá token
  const [owner, setOwner] = useState(null);//gán giá trị người triển khai
  const [approveAmounts, setApproveAmounts] = useState({}); //ủy quyền
  const [tradeAmount, setTradeAmount] = useState(''); //số lượng bán
  const [selectedToken, setSelectedToken] = useState(''); //loại token bán
  const [tokenBalances, setTokenBalances] = useState({}); //cập nhật số dư của token đã chọn để bánc  
  const [trades, setTrades] = useState([]);//danh sách các gói bán
  const [tradeHistory, setTradeHistory] = useState([]); //lịch sử các gói trao đổi

  const [tradeResults, setTradeResults] = useState({
    tradeIds: [],
    sellers: [],
    tokenAmounts: [],
    lkkPrices: []
  });

  useEffect(() => {
    const loadWeb3 = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          // Yêu cầu quyền truy cập tài khoản
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          // Lấy danh sách tài khoản
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]); // Lấy tài khoản đầu tiên

          // Khởi tạo instance của LKK token
          const LKKContractInstance = new web3Instance.eth.Contract(Contract.ERC20ABI, Contract.LKKAddress);
          setLKKContract(LKKContractInstance);

          // Khởi tạo instance của Exchange
          const ExchangeContractInstance = new web3Instance.eth.Contract(Contract.ExchangeABI, Contract.ExchangeAddress);
          setExchangeContract(ExchangeContractInstance);

          // xác nhận SC đã được thực thi
          setContractInitialized(true);

        } catch (error) {
          console.error(error);
        }
      }
    };
    loadWeb3();
  }, []);

  // useEffect để gọi các hàm sau khi contract đã được thiết lập
  useEffect(() => {
    if (contractInitialized) {
      handleGetBalance();
      getTokenList();
      fetchOwner(); 
    }
  }, [contractInitialized]);

  //hàm gọi lấy số dư LKK
  const handleGetBalance = async () => {
    try {
      const result = await LKKContract.methods.balanceOf(account).call();
      setBalance(result.toString());   
    } catch (error) {
      console.error(error);
    }
  };

  //ủy quyền đồng trung gian LKK
  const handleApproveLKK = async () => {
    try {
      await LKKContract.methods.approve(Contract.ExchangeAddress, approveLKKAmount).send({ from: account });
      alert('Đã ủy quyền thành công cho LKK');
    } catch (error) {
      console.error("Error approving LKK token:", error);
    }
  };
  
  const handleAddToken = async () => {
    try {
      // Gọi phương thức addToken từ hợp đồng Exchange với địa chỉ token từ trường nhập liệu
      await exchangeContract.methods.addToken(tokenAddressInput).send({ from: account });
      alert(`Đã thêm thành công token vào sàn`);
      getTokenList(); // cập nhật danh sách token sau khi thêm thành công
    } catch (error) {
      console.error("Error adding token:", error);
    }
  };

  //danh sách các token đã thêm vào
  const getTokenList = async () => {
    try {
        const tokens = await exchangeContract.methods.getTokenList().call();
        setTokenList(tokens);
        getTokensPrice(tokens); // Cập nhật giá của các token
    } catch (error) {
        console.error('Error getting token list:', error);
    }
  };
  //xác định địa chỉ người triển khai
  const fetchOwner = async () => {
    try {
      const ownerAddress = await exchangeContract.methods.owner().call();
      setOwner(ownerAddress);
    } catch (error) {
      console.error('Error fetching owner:', error);
    }
  };
  
  //gọi hàm lấy giá trị của token
  const getTokensPrice = async (tokens) => {
    try {
      const prices = {};
      for (let token of tokens) {
        const price = await exchangeContract.methods.getTokenPrice(token).call();
        prices[token] = price;
      }
      setTokenPrices(prices);
    } catch (error) {
      console.error('Error getting token prices:', error);
    }
  };

   // Hàm để định giá token
  const handleSetTokenPrice = async (tokenAddress) => {
    if (account !== owner) {
      alert('Bạn không có quyền thực hiện hành động này.');
      return;
    }
    try {
      await exchangeContract.methods.setTokenPrice(tokenAddress, priceInput).send({ from: account });
      alert(`Đã đặt giá token thành công`);
      getTokenList(); // Cập nhật giá token sau khi đặt
    } catch (error) {
      console.error("Error setting token price:", error);
    }
  };

  //ủy quyền theo token
  const handleApproveToken = async (tokenAddress, amount) => {
    try {
      const tokenContract = new web3.eth.Contract(Contract.ERC20ABI, tokenAddress);
      await tokenContract.methods.approve(Contract.ExchangeAddress, amount).send({ from: account });
      alert('Đã ủy quyền thành công');
    } catch (error) {
      console.error("Error approving token:", error);
    }
  };

  //cập nhật số lượng token kiểm tra tr khi bán
  const updateTokenBalances = async (tokens) => {
    const balances = {};
    for (let token of tokens) {
      const tokenContract = new web3.eth.Contract(Contract.ERC20ABI, token);
      const balance = await tokenContract.methods.balanceOf(account).call();
      balances[token] = balance;
    }
    setTokenBalances(balances);
  };
  
  useEffect(() => {
    if (tokenList.length > 0) {
      updateTokenBalances(tokenList);
    }
  }, [tokenList, account]);
  
  const handleCreateTrade = async () => {
    try {
      if (!selectedToken || !tradeAmount) {
        alert('Vui lòng chọn token hoặc nhập số lượng để bán');
        return;
      }
      if (parseFloat(tradeAmount) > parseFloat(tokenBalances[selectedToken] || '0')) {
        alert('Bạn không đủ token để bán');
        return;
      }
      await exchangeContract.methods.createTrade(selectedToken, tradeAmount).send({ from: account });
      alert(`Đã tạo gói bán ${tradeAmount} token: ${selectedToken}`);
    } catch (error) {
      console.error("Error creating trade:", error);
    }
  };

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const result = await exchangeContract.methods.getTrades().call();
        // Chuyển đổi các giá trị từ số nguyên sang chuỗi trước khi set state
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

    const fetchTradeHistory = async () => {
      if (exchangeContract) {
        try {
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
      }
    };

    if (exchangeContract) {
        fetchTrades();
        fetchTradeHistory();
      }
    }, [exchangeContract]);

  //mua các gói
  const handleBuyTrade = async (tradeId) => {
    try {
      await exchangeContract.methods.buyTrade(tradeId).send({ from: account });
      alert(`Trade with ID ${tradeId} bought successfully`);

      // Sau khi mua thành công, cập nhật lại danh sách giao dịch
      const updatedTrades = trades.filter(trade => trade.tradeId !== tradeId);
      setTrades(updatedTrades);
    } catch (error) {
      console.error(`Error buying trade with ID ${tradeId}:`, error);
    }
  };

  // Hàm hủy gói bán
  const cancelTrade = async (tradeId) => {
    try {
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

  //tìm kiếm
  const findTradesByToken = async () => {
    try {
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
    <div className={styles.MyComponent}>
      <Navbar userAddress={account}/>
      <h1 className={styles.welcom}>Welcome to the Exchange Platform</h1>

      <div className={styles.infor}>
        <div>
          <div className={styles.account}><p><b>Địa chỉ ví:</b></p> <p className={styles.value}>{account}</p></div>
          <div className={styles.account}><p><b>Địa chỉ token LKK:</b></p> <p className={styles.value}>{LKKContract ? LKKContract.options.address : "Loading..."} </p></div>
          <div className={styles.account}><p><b>Địa chỉ sàn giao dịch:</b></p> <p className={styles.value}>{exchangeContract ? exchangeContract.options.address : "Loading..."}</p></div>
          <div className={styles.account}><p><b>Token LKK hiện có:</b></p> <p className={styles.value}>{balance} LKK</p></div>
        </div>
        
        <div>
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

          <div className={styles.approveLKK}>
            <h2 className={styles.title}>Add token:</h2>
            <input className={styles.getnumber}
              type="text" 
              placeholder="Enter Token Address" 
              value={tokenAddressInput} 
              onChange={(e) => setTokenAddressInput(e.target.value)} 
            />
            <button className={styles.buttonInput}  onClick={handleAddToken}>Add Token</button>
          </div>
        </div>
      </div>

      
      <div className={styles.tokenList}>
        <h2 className={styles.title}>Token List:</h2>
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
              <button className={styles.buttonInput} onClick={() => handleSetTokenPrice(token, tokenPrices[token])}>
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

      <div >
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
          <div >
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


      <div>
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
        <button className={styles.button_2} onClick={handleCreateTrade}>
          Create Trade
        </button>
      </div>


      <div className={styles.tableContainer}>
        <h2 className={styles.title}>List Trades</h2>
        <table className={styles.tradeTable}>
          <thead>
            <tr>
              <th>Trade ID</th>
              <th>Seller</th>
              <th>Token Address</th>
              <th>Token Amount</th>
              <th>LKK Price</th>
              <th>Bán</th>
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
                <td colSpan="5">No trades available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
  );
}

export default MyComponent;