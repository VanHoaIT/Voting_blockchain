import { useEffect, useState } from 'react';
import Web3 from 'web3';
import * as Contract from '../service/service'

// import Navbar from '../components/Navbar';
import styles from '../styles/MyComponent.module.css';

import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

const MyComponent = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null); //gán tài khoản đăng nhập 
  const [contract, setContract] = useState(null); //gán hợp đồng tạo thành công
  const [votingContract, setVotingContract] = useState(null); //gán hợp đồng tạo thành công Voting
  const [balance, setBalance] = useState(null); //gán số dư đồng itoken
  const [addressBTC, setaddressBTC ] = useState(null); //gán địa chỉ của BTC
  const [recipient, setRecipient] = useState(''); //
  const [amount, setAmount] = useState(''); //gán số 
  const [contractInitialized, setContractInitialized] = useState(false); //kiểm tra SC đã thực thi chưa
  const [allowance, setallowance] = useState(null); // kiểm tra xem đã ủy quyền cho SC bao nhiêu
  const [statusSC, setStatusSC ] = useState(); // trạng tháng của SC

  const [candidateId, setCandidateId] = useState('');//các tham số thêm ứng viên
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

  const [showBTCInfo, setShowBTCInfo] = useState(false); //kiểm tra xem phải btc khong


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

          // Khởi tạo instance của Itoken
          const myContract = new web3Instance.eth.Contract(Contract.ItokenABI, Contract.ItokenAddress, Contract.VotingABI, Contract.VotingAddress);
          setContract(myContract);

          // Khởi tạo instance của Voting
          const votingContractInstance = new web3Instance.eth.Contract(Contract.VotingABI, Contract.VotingAddress);
          setVotingContract(votingContractInstance);

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

  const setContentNameSC = async () => {
    if (account !== addressBTC) {
      alert("Chỉ địa chỉ BTC mới có thể thực hiện");
      return;
    }
    try {
      // Gọi hàm setContestName từ smart Votingcontract
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
      // gán kết quả vào
      setBalance(result.toString());
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
      // Thực hiện gọi hàm mở Votingcontract
      await votingContract.methods.openVoting().send({ from: account });
      setStatusSC(true);
      alert("Cuộc bình chọn đã mở");
      // Xử lý các hành động sau khi mở bỏ phiếu thành công
    } catch (error) {
      console.error(error);
      // Xử lý các hành động khi có lỗi xảy ra
    }
  };

  const closeVoting = async () => {
    if (account !== addressBTC) {
      alert("Chỉ địa chỉ BTC mới có thể thực hiện");
      return;
    }
    try {
      // Thực hiện gọi hàm đóng trên Votingcontract
      await votingContract.methods.closeVoting().send({ from: account });
      setStatusSC(false);
      alert("Cuộc bình chọn đã đóng");
      // Xử lý các hành động sau khi mở bỏ phiếu thành công
    } catch (error) {
      console.error(error);
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

  //kiểm tra trạng thái gọi hàm thích hơp
  const OpenOrCloseSC = async () => {
    if (statusSC) {
      closeVoting(); // Gọi hàm closeVoting nếu statusSC là true
    } else {
      openVoting(); // Gọi hàm openVoting nếu statusSC là false
    }
  }

  //số token đã ủy quyền cho VotingContract
  const handleAllowance = async () => {
    try {
      // Sử dụng hàm approve từ smart contract
      const result = await contract.methods.allowance(account, Contract.VotingAddress).call();
      setallowance(result.toString());
    } catch (error) {
      console.error(error);
    }
  };

  //chuyển token
  const handleTransfer = async () => {
    try {
      await contract.methods.transfer(recipient, amount).send({ from: account });
      setBalance(balance - amount);
      alert(`Đã chuyển thành công ${amount} tokens  Cho địa chỉ ${recipient}`);
      handleGetBalance();
    } catch (error) {
      console.error(error);
    }
  };

  //ủy quyền
  const handleApprove = async () => {
    try {
      // Sử dụng hàm approve từ smart contract
      await contract.methods.approve(Contract.VotingAddress, amount).send({ from: account });
      alert(`Đã ủy quyền thành công ${amount} tokens cho Hợp đồng Voting ${votingAddress}`);
      handleAllowance();
    } catch (error) {
      console.error(error);
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
        .send({ from: account }); //

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

      // gán kết quả
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
      //gọi hàm removeCandidate để xóa ứng viên theo ID
      await votingContract.methods.removeCandidate(candidateId).send({ from: account });
      console.log(`Candidate with ID ${candidateId} removed successfully.`);
      // Tải lại danh sách ứng viên sau khi xóa
      await getCandidateList();
      alert('Đã xóa thành công')
    } catch (error) {
      console.error(error);
    }
  };
  
  // Hàm "Update"
  const handleUpdateCandidate = async () => {
    if (account !== addressBTC) {
      alert("Chỉ địa chỉ BTC mới có thể thực hiện");
      return;
    }
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

  //tìm kiếm
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
  
  //thu hồi itoken từ SC về BTC
  const withdrawToken = async () => {
    if (account !== addressBTC) {
      alert("Chỉ địa chỉ BTC mới có thể thực hiện");
      return;
    }
    try {
      await votingContract.methods.withdrawToken().send({ from: account });
      alert("Đã thu hồi thành công");
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert("Withdrawal failed. Please try again later.");
    }
  };
  

  return (
    <div className={styles.myComponent}>

      <h1 className={styles.title_hh}>Cuộc thi {nameSC}</h1>



      <div className={styles.currentAccount}><p><b>Địa chỉ hiện tại:</b></p> <p className={styles.value}>{account}</p></div>
      <div className={styles.currentAccount}><p><b>Token đang có:</b></p> <p className={styles.value}>{balance} ITK</p></div>
      <div className={styles.currentAccount}><p><b>Token đã uỷ quyền:</b></p> <p className={styles.value}>{allowance} ITK</p></div>

      <div className={styles.group_2}>
        <div>
          <h5 className={styles.title_2}>Uỷ quyền</h5>
          <div className={styles.get_number}>
            <input
              className={styles.input_get_number}
              type="number"
              placeholder="Số lượng"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button className={styles.button_get_2} onClick={handleApprove} disabled={!amount}>
            Ủy quyền
          </button>
        </div>


        <div>
          <h5 className={styles.title_2}>Chuyển token</h5>
          <div className={styles.div_group_2}>
            <input
              className={styles.input_get_text}
              type="text"
              placeholder="Địa chỉ đến"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <input
              className={styles.input_get_number}
              type="number"
              placeholder="Số lượng"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className={styles.button_get_22}>
            <button className={styles.button_get} onClick={handleTransfer} disabled={!recipient || !amount}>
              Chuyển
            </button>
          </div>
        </div>
      </div>



      {/*<p>Voting Status: {statusSC ? 'Open' : 'Closed'}</p>*/}

      <div>
        <h2 className={styles.title_candidate_list}>Danh sách ứng viên</h2>
        <div className={styles.div_table}>
          <table className={styles.container}>
            <thead>
              {/* className={styles.th_table}*/}
              <tr className={styles.head}>
                <th>ID</th>
                <th>Tên ứng viên</th>
                <th>Số lượng bình chọn</th>
                <th>Tùy chọn</th>
              </tr>
            </thead>
            <tbody>
              {
                candidates.map(candidate => (
                  <tr>
                    <td data-title="ID">{candidate.id}</td>
                    <td data-title="Name">{candidate.name}</td>
                    <td data-title="Link" className={styles.center_vote}>{candidate.numVotes}</td>
                    <td data-title="Status">
                      <button className={styles.button_1} onClick={() => handleVote(candidate.id)}>Bình chọn</button>
                      <button className={styles.button_2} onClick={() => removeCandidate(candidate.id)}>Xoá ứng viên</button>
                      {updatingCandidateId === candidate.id ? (
                        <div>
                          <input className={styles.input_update} type="text" placeholder="Tên mới" value={newName} onChange={e => setNewName(e.target.value)} />
                          <input className={styles.input_update} type="text" placeholder="Mô tả mới" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
                          <button className={styles.button_update_1} onClick={handleUpdateCandidate}>Update</button>
                          <button className={styles.button_update_2} onClick={handleCancelUpdate}>Cancel</button>
                        </div>
                      ) : (
                        <button className={styles.button_3} onClick={() => setUpdatingCandidateId(candidate.id)}>Cập nhật</button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>

          <div className={styles.container_search}>
            <div className={styles.search_candidate}>
              <div className={styles.group_search}>
                <div className={styles.input_container}>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className={styles.input}
                    placeholder='Nhập id hoặc tên ứng viên'
                  />
                </div>
                <button
                  onClick={() => searchCandidate(searchValue)}
                  className={styles.button_search}
                >
                  Tìm kiếm
                </button>
              </div>

              {notFound ? (
                <p className={styles.no_candidate}>Không tìm thấy ứng viên!</p>
              ) : searchResult ? (
                <div className={styles.result}>
                  {/* <h2>Search Result</h2> */}
                  <p><b className={styles.title_candidate}>ID:</b> {searchResult.id}</p>
                  <p><b className={styles.title_candidate}>Tên ứng viên:</b> {searchResult.name}</p>
                  <p><b className={styles.title_candidate}>Mô tả:</b> {searchResult.description}</p>
                  <p><b className={styles.title_candidate}>Số lượt bình chọn:</b> {searchResult.numVote}</p>
                </div>
              ) : null}
            </div>

          </div>
        </div>
      </div>

      <div className={styles.lich_su}>
        <p>
          <a href='https://baobab.klaytnscope.com/account/0x162668bEfDD2ff85F7305cCAa660E0fC36c9131C?tabId=txList' target='_blank'>Lịch sử bình chọn</a>
        </p>
      </div>


      <div className={styles.foot}>
        <div>
          {showBTCInfo && (
            <div>
              <div>
                {(
                  <div className={styles.group_1}>
                    <div className={styles.input_container_name}>
                      <input
                        className={styles.input_name}
                        type="text"
                        placeholder="Tên cuộc thi"
                        onChange={(e) => setNameSC(e.target.value)}
                      />
                    </div>
                    <button className={styles.button_name} onClick={() => setContentNameSC(nameSC)}>
                    Đặt tên
                    </button>
                  </div>
                )}
              </div>
    
              <div className={styles.group_add}>
                {/* <h1>Add Candidate</h1> */}
                {/* <label>Candidate ID:</label> */}
                <div className={styles.input_container_add}>
                  <input
                    className={styles.input_add}
                    type="text"
                    value={candidateId}
                    onChange={(e) => setCandidateId(e.target.value)}
                    placeholder=' '
                  />
                  <div className={styles.cut_1}></div>
                  <label for="ID" className={styles.placeholder}>ID</label>
                </div>
                {/* <label>Candidate Name:</label> */}
                <div className={styles.input_container_add} id={styles.input_1}>
                  <input
                    className={styles.input_add}
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder=' '
                  />
                  <div className={styles.cut_2}></div>
                  <label for="Name" className={styles.placeholder}>Tên ứng viên</label>
                </div>
                {/* <label>Candidate Description:</label> */}
                <div className={styles.input_container_add} id={styles.input_2}>
                  <input
                    className={styles.input_add}
                    type="text"
                    value={candidateDescription}
                    onChange={(e) => setCandidateDescription(e.target.value)}
                    placeholder=' '
                  />
                  <div className={styles.cut_3}></div>
                  <label for="Description" className={styles.placeholder}>Mô tả</label>
                </div>
                <button button className={styles.button_add} onClick={handleAddCandidate}>Thêm ứng viên</button>
              </div>
    
            </div>
          )}
        </div>

        <div>
          {showBTCInfo && (
            <div>          
              <button
                className={styles.button_open}
                onClick={OpenOrCloseSC} // Gọi hàm handleVotingAction khi nhấn nút
                style={{ backgroundColor: statusSC ? 'green' : 'blue' }} // Áp dụng màu và kiểu con trỏ tùy thuộc vào giá trị của statusSC
              >
                {statusSC ? 'Đóng' : 'Mở'} cuộc bình chọn
              </button>
    
              <button
                className={styles.button_withdraw}
                onClick={withdrawToken}
                style={{ backgroundColor: 'blue', cursor: 'pointer' }}
              >
                Thu hồi token
              </button>
            </div>
          )}
        </div>
        
      </div>

    </div>

  );
};

export default MyComponent;

