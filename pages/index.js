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
  

  return (
    <div className={styles.MyComponent}>
      <Navbar userAddress={account}/>
      <h1 className={styles.welcom}>Welcome to the Exchange Platform</h1>

      <div className={styles.infor}>
        <div>
          <div className={styles.account}><p><b>Địa chỉ token LKK:</b></p> <p className={styles.value}>{LKKContract ? LKKContract.options.address : "Loading..."} </p></div>
          <div className={styles.account}><p><b>Địa chỉ sàn giao dịch:</b></p> <p className={styles.value}>{exchangeContract ? exchangeContract.options.address : "Loading..."}</p></div>
          <div className={styles.account}><p><b>Token LKK hiện có:</b></p> <p className={styles.value}>{balance} LKK</p></div>
        </div>
      </div>
      
    </div>
  );
}

export default MyComponent;