// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

//Định dạng ERC20 dùng để hiểu token đưa vào
interface IToken {
    function transferFrom(address, address, uint256) external returns (bool);

    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external view returns (bool);

    function balanceOf(address) external view returns (uint256);

    function totalSupply() external returns (uint256);
}

contract Voting {
    IToken public votingToken; //địa chỉ token đưa vào
    address public addressBTC; //địa chỉ của BTC triển khai cuộc thi
    bool public votingOpen; //mở đóng cuộc bình chọn
    string public contestName; //tên cuộc bình chọn

    //kiểm tra người thực hiện có phải là BTC    
    modifier onlyOwner() {
        require(msg.sender == addressBTC, "Only the addressBTC can call this function.");
        _;
    }

    event Message(string text);
    event VotingOpened();
    event VotingClosed();
    event VoteCasted(uint256 candidateId, address voter);

    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 numVote;
    }

    mapping(uint256 => Candidate) public candidates;
    uint256 public candidateCount; //số lượng ứng viên

    Candidate[] public listcandidates; // Danh sách các ứng viên


    constructor(address _votingToken, address _addressBTC) {
        votingToken = IToken(_votingToken);
        addressBTC = _addressBTC;
    }

    // hàm mở cuộc bình chọn
    function openVoting() public onlyOwner{
        require(!votingOpen, "Voting is already open.");
        votingOpen = true;
        emit VotingOpened();
    }

    //hàm đóng cuộc bình chọn
    function closeVoting() public {
        require(votingOpen, "Voting is already closed.");
        votingOpen = false;
        emit VotingClosed();
    }

    //hàm đặt tên cuộc bình chọn
    function setContestName(string memory _name) public onlyOwner {
        require(bytes(_name).length > 0, "dfjdhsjf");
        // require(votingOpen, "Voting is currently open. Cannot set contest name.");
        contestName = _name;
    }

    //hàm thêm ứng viên
    function addCandidate(uint256 _id, string memory _name, string memory _description) public onlyOwner {
        require(_id > 0, "Invalid candidate ID.");
        require(keccak256(bytes(_name)) != keccak256(""), "no name");

    
        for (uint256 i = 0; i < candidateCount; i++) {
            require(_id != listcandidates[i].id, "Candidate with the given ID already exists.");
        }

        candidates[_id] = Candidate(_id, _name, _description, 0);
        listcandidates.push(candidates[_id]);
        candidateCount++;
    }

    //danh sách các ứng viên
    function getCandidateList() public view returns (uint256[] memory ids, string[] memory names, uint256[] memory numVotes) {
        ids = new uint256[](listcandidates.length);
        names = new string[](listcandidates.length);
        numVotes = new uint256[](listcandidates.length);
        for (uint256 i = 0; i < listcandidates.length; i++) {
            Candidate storage listcandidate = listcandidates[i];
            ids[i] = listcandidate.id;
            names[i] = listcandidate.name;
            numVotes[i] = listcandidate.numVote;
        }
        return (ids, names, numVotes);
    }

    // hàm vote --phải ủy quyền cho SC roi vote
    function vote(uint256 _candidateId) public {
        require(votingOpen, "Voting is currently open. Cannot set contest name.");

        //kiểm tra xem người vote có đủ token k??
        require(votingToken.balanceOf(msg.sender) > 0, "Insufficient tokens to vote.");

        // Chuyển token cho hợp đồng bình chọn
        require(votingToken.transferFrom(msg.sender, address(this), 1), "chuyen token that bai");
        
        // Cập nhật listcandidates
        for (uint256 i = 0; i < listcandidates.length; i++) {
            if (listcandidates[i].id == _candidateId) {
                listcandidates[i].numVote++;
                candidates[_candidateId].numVote++;// Tăng số phiếu bầu cho ứng viên
                break;
            }
            else {
                emit Message("Data processing complete!");
            }
        }
        emit VoteCasted(_candidateId, msg.sender);
    }

    //xem số dư
    function getBalanceTokenAdd(address _user) public view returns (uint256) {
        uint256 balance = votingToken.balanceOf(_user);
        return balance;
    }    

    //hàm tổng lượng vote trong cuộc bình chọn
    function getTotalVotes() public view returns (uint256) {
        uint256 totalVotes = 0;
        for (uint256 i = 0; i < listcandidates.length; i++) {
            totalVotes += listcandidates[i].numVote;
        }
        return totalVotes;
    }

    //sửa thông tin ứng viên (cập nhật)
    function updateCandidate(uint256 _id, string memory _name, string memory _description) public onlyOwner {
        require(_id > 0, "Invalid candidate ID.");

        bool candidateExists = false; // Biến để kiểm tra xem ứng viên có tồn tại hay không

        for (uint256 i = 0; i < candidateCount; i++) {
            if(_id == listcandidates[i].id)
            {
                candidates[_id].name = _name;
                candidates[_id].description = _description;
                listcandidates[i] = candidates[_id];
                candidateExists = true;
                break; // Thoát khỏi vòng lặp
            }
        }

        // Kiểm tra xem ứng viên có tồn tại không, nếu không, ném ra một ngoại lệ
        require(candidateExists, "Candidate does not exist.");
    }

    //xóa ứng viên
    function removeCandidate(uint256 _id) public onlyOwner {
        require(_id > 0, "Invalid candidate ID.");

        bool candidateExists = false; // Biến để kiểm tra xem ứng viên có tồn tại hay không

        for (uint256 i = 0; i < candidateCount; i++) {
            if (_id == listcandidates[i].id) {
                candidateExists = true;
                delete candidates[_id];
                listcandidates[i] = listcandidates[listcandidates.length - 1];
                listcandidates.pop();
                candidateCount--;
                break; // Thoát khỏi vòng lặp sau khi tìm thấy ứng viên
            }
        }

        // Kiểm tra xem ứng viên có tồn tại không, nếu không, ném ra một ngoại lệ
        require(candidateExists, "Candidate does not exist.");
    }


    //lấy token SC về BTC
    function withdrawToken() external onlyOwner{
        uint256 balanSC = getBalanceTokenAdd(address(this));
        require(balanSC > 0, "Khong co token trong SC");
        
        require(votingToken.transfer(msg.sender, balanSC), "Lay khong thanh cong");
    }

}