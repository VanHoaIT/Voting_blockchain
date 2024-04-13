import { useEffect, useState } from 'react';
import Web3 from 'web3';
import * as Contract from '../service/service'

// import Navbar from '../components/Navbar';
import styles from '../styles/MyComponent.module.css';

import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

const MyComponent = () => {
  const router = useRouter();//chuyển trang
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [votingContract, setVotingContract] = useState(null);
  const [balance, setBalance] = useState(null);
  const [symbol, setSymbol ] = useState(null);
  const [name, setName ] = useState(null);
  const [addressBTC, setaddressBTC ] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false); // Biến trạng thái tạm thời
  const [contractInitialized, setContractInitialized] = useState(false);
  const [allowance, setallowance] = useState(null); // kiểm tra xem đã ủy quyền cho SC bao nhiêu
  const [statusSC, setStatusSC ] = useState(); // trạng tháng của SC

  const [candidateId, setCandidateId] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateDescription, setCandidateDescription] = useState('');

  const [candidates, setCandidates] = useState([]);//danh sách ứng viên
  const [nameSC, setNameSC ] = useState(null); // tên cuộc bình chọn

  const [updatingCandidateId, setUpdatingCandidateId] = useState(null);//update
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [searchValue, setSearchValue] = useState(''); // Tìm kiếm
  const [searchResult, setSearchResult] = useState(null);
  const [notFound, setNotFound] = useState(false);// thông báo tìm thấy ứng viên hay không

  const [showBTCInfo, setShowBTCInfo] = useState(false);


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

          // Địa chỉ của smart contract và ABI
          const contractAddress = 'YOUR_CONTRACT_ADDRESS';
          const abi = []; // ABI của smart contract

          // Khởi tạo instance của Itoken
          const myContract = new web3Instance.eth.Contract(Contract.ItokenABI, Contract.ItokenAddress, Contract.VotingABI, Contract.VotingAddress);
          setContract(myContract);

          // Khởi tạo instance của Voting
          const votingContractInstance = new web3Instance.eth.Contract(Contract.VotingABI, Contract.VotingAddress);
          setVotingContract(votingContractInstance);

        // Gọi hàm getSymbol để lấy symbol và cập nhật state
        setContractInitialized(true);

        
        } catch (error) {
          console.error(error);
        }
      }
    };
    loadWeb3();
  }, []);

  // useEffect để gọi hàm getSymbol sau khi contract đã được thiết lập
  useEffect(() => {
    if (contractInitialized) {
      getSymbol();
      getName();
      getAddressBTC();
      statusSmartContract();
      getCandidateList();
      handleGetBalance();
      handleAllowance();
    }
  }, [contractInitialized]);

  useEffect(() => {
    // Kiểm tra xem address từ Metamask có phải là addressBTC không
    setShowBTCInfo(account === addressBTC);
  }, [account, addressBTC]);

  // // kiểm tra có phải là địa chỉ BTC không
  // useEffect(() => {
  //   // Kiểm tra xem address từ Metamask có phải là addressBTC không
  //   setIsBTCAddress(account === addressBTC);
  // }, [account, addressBTC]);

  const setContentNameSC = async () => {
    if (account !== addressBTC) {
      alert("Chỉ địa chỉ BTC mới có thể thực hiện");
      return;
    }
    try {
      // Gọi hàm symbol từ smart contract
      const result = await votingContract.methods.setContestName(nameSC).send({from: account });
      setNameSC(result.toString());
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetBalance = async () => {
    try {
      // Gọi hàm balanceOf từ smart contract
      const result = await contract.methods.balanceOf(account).call();
      setBalance(result.toString());
    } catch (error) {
      console.error(error);
    }
  };

  const getSymbol = async () => {
    try {
      // Gọi hàm symbol từ smart contract
      const result = await contract.methods.symbol().call();
      setSymbol(result);
      
    } catch (error) {
      console.error(error);
    }
  };

  const getName = async () => {
    try {
      // Gọi hàm symbol từ smart contract
      const result = await contract.methods.name().call();
      setName(result);
      
    } catch (error) {
      console.error(error);
    }
  };

  const getAddressBTC = async () => {
    try {
      // Gọi hàm symbol từ smart contract
      const result = await votingContract.methods.addressBTC().call();
      setaddressBTC(result);
      
    } catch (error) {
      console.error(error);
    }
  };

  const openVoting = async () => {
    if (account !== addressBTC) {
      alert("Chỉ địa chỉ BTC mới có thể thực hiện");
      return;
    }
    try {
      // Thực hiện gọi hàm mở bỏ phiếu trên smart contract
      const result = await votingContract.methods.openVoting().send({ from: account });
      setStatusSC(true);
      alert("Cuộc bình chọn đã mở");
      // Xử lý các hành động sau khi mở bỏ phiếu thành công
    } catch (error) {
      console.error('Error opening voting:', error);
      // Xử lý các hành động khi có lỗi xảy ra
    }
  };

  const closeVoting = async () => {
    if (account !== addressBTC) {
      alert("Chỉ địa chỉ BTC mới có thể thực hiện");
      return;
    }
    try {
      // Thực hiện gọi hàm mở bỏ phiếu trên smart contract
      const result = await votingContract.methods.closeVoting().send({ from: account });
      setStatusSC(false);
      alert("Cuộc bình chọn đã mở");
      // Xử lý các hành động sau khi mở bỏ phiếu thành công
    } catch (error) {
      console.error('Error opening voting:', error);
      // Xử lý các hành động khi có lỗi xảy ra
    }
  };
  

  // trạng thái của smartcontract
  const statusSmartContract = async () => {
    try {
      // Gọi hàm votingOpen từ smart contract và cập nhật state
      const status = await votingContract.methods.votingOpen().call();
      setStatusSC(status);
      
    } catch (error) {
      console.error(error);
    }
  }

  const OpenOrCloseSC = async () => {
    if (statusSC) {
      closeVoting(); // Gọi hàm closeVoting nếu statusSC là true
    } else {
      openVoting(); // Gọi hàm openVoting nếu statusSC là false
    }
  }

  const handleAllowance = async () => {
    try {
      // Sử dụng địa chỉ của hợp đồng VotingAddress từ Contract
      const votingAddress = Contract.VotingAddress;
      // Sử dụng hàm approve từ smart contract
      const result = await contract.methods.allowance(account, votingAddress).call();
      setallowance(result.toString());
    } catch (error) {
      console.error(error);

    }
  };



  const handleTransfer = async () => {
    try {
      await contract.methods.transfer(recipient, amount).send({ from: account });
      setBalance(balance - amount);
      alert(`Đã chuyển thành công ${amount} tokens 
      Cho địa chỉ ${recipient}`);
      handleGetBalance();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      // Sử dụng địa chỉ của hợp đồng VotingAddress từ Contract
      const votingAddress = Contract.VotingAddress;
      // Sử dụng hàm approve từ smart contract
      await contract.methods.approve(votingAddress, amount).send({ from: account });
      alert(`Đã ủy quyền thành công ${amount} tokens cho
       Hợp đồng Voting ${votingAddress}`);
      handleAllowance();
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    if (account !== addressBTC) {
      alert("Chỉ địa chỉ BTC mới có thể thực hiện");
      return;
    }
    try {
      // Kiểm tra xem contract đã được khởi tạo chưa
      if (!contract) {
        console.error('Contract is not initialized.');
        return;
      }

      // Gọi hàm addCandidate từ smart contract
      await votingContract.methods
        .addCandidate(candidateId, candidateName, candidateDescription)
        .send({ from: account }); // Thay yourAddress bằng địa chỉ của bạn

      // Hiển thị thông báo thành công nếu gọi hàm thành công
      alert('Đã thêm ứng viên thành công');
      await getCandidateList();
    } catch (error) {
      console.error(error);
      // Hiển thị thông báo lỗi nếu có lỗi xảy ra
      alert('Đã bỏ trống hoặc nhập chưa đúng');
    }
  };

  //hiển thị danh sách các ứng viên được vote
  const getCandidateList = async () => {
    try {
      // Gọi hàm getCandidateList từ smart contract
      const result = await votingContract.methods.getCandidateList().call();

      // Giải mã kết quả
      const ids = result[0].map(id => id.toString());
      const names = result[1];
      const numVotes = result[2].map(id => id.toString());

      // Tạo danh sách các ứng viên từ dữ liệu nhận được
      const candidateList = ids.map((id, index) => ({
        id,
        name: names[index],
        numVotes: numVotes[index]
      }));

      // Cập nhật state để render lại giao diện
      setCandidates(candidateList);
      console.log(candidateList);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVote = async (candidateId) => {
    // Kiểm tra trạng thái của cuộc bầu cử
    const votingOpen = await votingContract.methods.votingOpen().call();
    if (!votingOpen) {
      // Thông báo nếu cuộc bầu cử đã đóng
      alert("Cuộc bình chọn đã đóng");
      return;
    }

    try {
        await votingContract.methods.vote(candidateId).send({ from: account });
        // Thực hiện các hành động cần thiết sau khi bỏ phiếu thành công
        alert(`Đã vote thành công ứng viên ID = ${candidateId}`);
        getCandidateList();
        handleAllowance();
        handleGetBalance();
    } catch (error) {
      // Xử lý các lỗi nếu có
      console.error("Vote error:", error);
    }
  };

  //xóa ứng viên
  const removeCandidate = async (candidateId) => {
    if (account !== addressBTC) {
      alert("Chỉ địa chỉ BTC mới có thể thực hiện");
      return;
    }
    try {
      await votingContract.methods.removeCandidate(candidateId).send({ from: account });
      console.log(`Candidate with ID ${candidateId} removed successfully.`);
      // Tải lại danh sách ứng viên sau khi xóa
      await getCandidateList();
      alert('Đã xóa thành công')
    } catch (error) {
      console.error(error);
    }
  };
  
  // Hàm xử lý khi nhấn nút "Update"
  const handleUpdateCandidate = async () => {
    try {
      // Kiểm tra xem có đang cập nhật ứng viên nào không
      if (updatingCandidateId !== null && newName !== '' && newDescription !== '') {
        // Gọi hàm updateCandidate với thông tin mới
        await votingContract.methods.updateCandidate(updatingCandidateId, newName, newDescription).send({ from: account });
        // Sau khi cập nhật thành công, cập nhật lại danh sách ứng viên
        await getCandidateList();
        alert("Đã cập nhật thành công ứng viên")
        // Đặt updatingCandidateId về null để kết thúc quá trình cập nhật
        setUpdatingCandidateId(null);
        setNewName('');
        setNewDescription('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Hàm xử lý khi nhấn nút "Cancel"
  const handleCancelUpdate = () => {
    setUpdatingCandidateId(null);
    setNewName('');
    setNewDescription('');
  };


  const searchCandidate = async (searchValue) => {
    try {
      // Kiểm tra xem searchValue là số hay chuỗi
      const isId = !isNaN(searchValue);
      let candidateInfo;
  
      if (isId) {
        // Nếu searchValue là số, tìm kiếm ứng viên bằng ID
        candidateInfo = await votingContract.methods.candidates(searchValue).call();
      } else {
        // Nếu searchValue là chuỗi, tìm kiếm ứng viên bằng tên
        // Lặp qua danh sách ứng viên để tìm ứng viên có tên tương ứng
        for (let i = 0; i < candidates.length; i++) {
          if (candidates[i].name.toLowerCase() === searchValue.toLowerCase()) {
            // Nếu tìm thấy ứng viên, lấy thông tin của ứng viên
            candidateInfo = await votingContract.methods.candidates(candidates[i].id).call();
            break;
          }
        }
      }
  
      // Xử lý kết quả tìm kiếm
      if (candidateInfo) {
        // Hiển thị thông tin của ứng viên được tìm thấy
        console.log('Found candidate:', candidateInfo);
        //chuyển uint256 về dạng chuỗi để hiển thị
        const candidateInfoString = {
          id: candidateInfo.id.toString(),
          name: candidateInfo.name,
          description: candidateInfo.description,
          numVote: candidateInfo.numVote.toString()
        };
        setSearchResult(candidateInfoString);
        setNotFound(false);
      } else {
        // Nếu không tìm thấy ứng viên, thông báo cho người dùng
        console.log('Candidate not found');
        setNotFound(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  
  
  const withdrawToken = async () => {
    if (account !== addressBTC) {
      alert("Chỉ địa chỉ BTC mới có thể thực hiện");
      return;
    }
    try {
      await votingContract.methods.withdrawToken().send({ from: account });
      alert("Withdrawal successful!");
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert("Withdrawal failed. Please try again later.");
    }
  };
  

  return (
    <div className={styles.myComponent}>
      <Navbar/>
      <h1 className={styles.componentTitle}>Cuộc thi {nameSC}</h1>


      <div>
        {showBTCInfo && (
          <div>
            <input 
              className = {styles.input_get_text}
              type="text" 
              placeholder="tên cuộc thi" 
              onChange={(e) => setNameSC(e.target.value)}
            />
            <button className={styles.button_get} onClick={() => setContentNameSC(nameSC)}>
              Đặt tên Name SC
            </button>


            <button 
              className={styles.button_get}
              onClick={OpenOrCloseSC} // Gọi hàm handleVotingAction khi nhấn nút
              style={{ backgroundColor: statusSC ? 'green' : 'blue'}} // Áp dụng màu và kiểu con trỏ tùy thuộc vào giá trị của statusSC
            >
              {statusSC ? 'Close' : 'Open'} Voting
            </button>

          </div>
        )}
      </div>
      

      <p className={styles.currentAccount}>Current Account: {account}</p>

      <p className={styles.p_get}>Balance: {balance} ITK</p>
    
      <p className={styles.p_get}>Allowance: {allowance}</p>

      <input 
        className = {styles.input_get_number}
        type="number" 
        placeholder="Amount" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)} 
      />
      <button className={styles.button_get} onClick={handleApprove} disabled={!amount || loading}>
        Approve
      </button>
    <br/>
      <input 
        className = {styles.input_get_text}
        type="text" 
        placeholder="Recipient Address" 
        value={recipient} 
        onChange={(e) => setRecipient(e.target.value)} 
      />
      <input 
        className = {styles.input_get_number}
        type="number" 
        placeholder="Amount" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)} 
      />
      <button className={styles.button_get} onClick={handleTransfer} disabled={!recipient || !amount}>
        Transfer
      </button>

      

      <div>
        <h1>Add Candidate</h1>
        <label>Candidate ID:</label>
        <input
          className = {styles.input_get_number}
          type="text"
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
        />
        <label>Candidate Name:</label>
        <input
          className = {styles.input_get_text}
          type="text"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
        />
        <label>Candidate Description:</label>
        <input
          className = {styles.input_get_text}
          type="text"
          value={candidateDescription}
          onChange={(e) => setCandidateDescription(e.target.value)}
        />
        <button button className={styles.button_get} onClick={handleAddCandidate}>Add Candidate</button>
      </div>

      <p>Voting Status: {statusSC ? 'Open' : 'Closed'}</p>

      <div>
        <h2>Candidate List</h2>
        <ul>
          {candidates.map(candidate => (
            <li key={candidate.id}>
              ID: {candidate.id}, Name: {candidate.name}, Votes: {candidate.numVotes}
              <button className={styles.button_small} onClick={() => handleVote(candidate.id)}>Vote</button>
              <button className={styles.button_small} onClick={() => removeCandidate(candidate.id)}>Romove</button>
              {updatingCandidateId === candidate.id ? (
                <div>
                  <input type="text" placeholder="New Name" value={newName} onChange={e => setNewName(e.target.value)} />
                  <input type="text" placeholder="New Description" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
                  <button className={styles.button_small} onClick={handleUpdateCandidate}>Update</button>
                  <button className={styles.button_small} onClick={handleCancelUpdate}>Cancel</button>
                </div>
              ) : (
                <button className={styles.button_small} onClick={() => setUpdatingCandidateId(candidate.id)}>Update</button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Candidate Search</h2>
        <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
        <button onClick={() => searchCandidate(searchValue)}>Search</button>

        {notFound ? (
          <p>No candidate found.</p>
        ) : searchResult ? (
          <div>
            <h2>Search Result</h2>
            <p>ID: {searchResult.id}</p>
            <p>Name: {searchResult.name}</p>
            <p>Description: {searchResult.description}</p>
            <p>Number of Votes: {searchResult.numVote}</p>
          </div>
        ) : null}
      </div>

      <button 
        className={styles.button_get}
        onClick={withdrawToken}
        style={{ backgroundColor: 'blue', cursor: 'pointer' }}
      >
        Withdraw Token
      </button>



    </div>
  );
};

export default MyComponent;

