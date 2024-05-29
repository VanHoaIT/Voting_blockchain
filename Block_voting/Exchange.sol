// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

//kiểu đồng token
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}
// Định nghĩa smart contract cho sàn giao dịch
contract Exchange {
    LKK public lkkToken; // Đối tượng đồng LKK
    
    // Tạo một mapping để lưu trữ thông tin về gói HTK của người bán
    mapping(uint256 => uint256) public packageAmounts; //lưu thông tin gói token
    mapping(address => bool) public supportedTokens; // lưu để kiểm tra token có trong sàn chưa
    mapping(address => uint256) public tokenPrices; //Lưu tỉ giá của token
    address[] public tokenList; //tạo mảng lưu trữ các token được thêm vào
    address public owner; //người tạo hợp đồng sàn

    struct Trade {
        address seller; // Địa chỉ của người bán
        uint256 tokenAmount; // Số lượng token muốn bán
        uint256 lkkPrice; // Giá đổi từ HTK sang KTK
        address tokenAddresses; //Địa chỉ token
    }
    
    struct TradeHistory {
        address buyer; // Địa chỉ của người mua
        address seller; // Địa chỉ của người bán
        uint256 tokenAmount; // Số lượng HTK muốn bán
        uint256 lkkPrice; // Giá đổi từ HTK sang KTK
        address tokenAddresses; //Địa chỉ token
        uint256 timestamp; // thời gian
    }

    Trade[] public trades; // Danh sách các gói giao dịch
    TradeHistory[] public tradeHistory; //Lịch sử các gói giao dịch

    event TradeCreated(uint256 tradeId, address seller, uint256 tokenAmount, uint256 lkkPrice, address tokenAddresses);
    event TradeCompleted(uint256 tradeId, address seller, address buyer, uint256 tokenAmount, uint256 lkkAmount, address tokenAddresses);
    event TradeCancelled(uint256 tradeId, address seller);
    

    constructor( address _lkkToken) {
        // htkToken = HTK(_htkToken);
        lkkToken = LKK(_lkkToken);
        owner = msg.sender;
    }

    //thêm token vào sàn
    function addToken(address token) public {
        //kiểm tra nếu đã token có trong sàn thì dừng lại
        require(!supportedTokens[token], "Token already exists");

        supportedTokens[token] = true;
        tokenList.push(token);
    }

    //danh sách các token trong sàn
    function getTokenList() public view returns (address[] memory) {
        return tokenList;
    }

    //định giá token với lkk
    function setTokenPrice(address token, uint256 price) public {
        require(msg.sender == owner, "Only the contract owner can set token price");
        //kiểm tra token chưa có trong sàn thì dừng lại
        require(supportedTokens[token], "Token is not supported");

        tokenPrices[token] = price;
    }

    //hiện thị tỉ giá của token so với lkk
    function getTokenPrice(address token) public view returns (uint256) {
        require(supportedTokens[token], "Token is not supported");
        return tokenPrices[token];
    }

    // Tạo một gói giao dịch mới
    function createTrade(address token, uint256 amount) external {
        require(supportedTokens[token], "Token is not supported");

        IERC20 tokenContract = IERC20(token);

        require(tokenContract.balanceOf(msg.sender) >= amount, "Insufficient token balance");

        // Chuyển số lượng token từ người bán vào sàn
        tokenContract.transferFrom(msg.sender, address(this), amount);

        uint256 pricetoken = amount * getTokenPrice(token);

        trades.push(Trade(msg.sender, amount, pricetoken, token));

        uint256 tradeId = trades.length - 1;

        emit TradeCreated(tradeId, msg.sender, amount, pricetoken, token);

        // Lưu trữ thông tin gói token vào mapping packageAmounts
        packageAmounts[tradeId] = amount;
    }

    // Lấy danh sách các gói giao dịch đang có trên sàn
    function getTrades() public view returns (uint256[] memory tradeIds, address[] memory sellers, uint256[] memory tokenAmounts, uint256[] memory lkkPrices, address[] memory tokenAddresses) {
        tradeIds = new uint256[](trades.length);
        sellers = new address[](trades.length);
        tokenAmounts = new uint256[](trades.length);
        lkkPrices = new uint256[](trades.length);
        tokenAddresses = new address[](trades.length);

        for (uint256 i = 0; i < trades.length; i++) {
            Trade storage trade = trades[i];
            tradeIds[i] = i;
            sellers[i] = trade.seller;
            tokenAmounts[i] = trade.tokenAmount;
            lkkPrices[i] = trade.lkkPrice;
            tokenAddresses[i] = trade.tokenAddresses;// Thêm địa chỉ đồng tiền giao dịch vào mảng tokenAddresses
        }   

        return (tradeIds, sellers, tokenAmounts, lkkPrices, tokenAddresses);
    }

    // Mua một gói giao dịch từ người bán
    function buyTrade(uint256 _tradeId) external {
        require(_tradeId < trades.length, "Invalid trade ID");
        Trade storage trade = trades[_tradeId];

        require(lkkToken.balanceOf(msg.sender) >= trade.lkkPrice, "Insufficient LKK balance");
        require(lkkToken.allowance(msg.sender, address(this)) >= trade.lkkPrice, "Insufficient allowance");

        // Chuyển số lượng LKK từ người mua vào sàn
        lkkToken.transferFrom(msg.sender, address(this), trade.lkkPrice);

        IERC20 tokenContract = IERC20(trade.tokenAddresses);

        // Chuyển đồng token từ sàn cho người mua
        tokenContract.transfer(msg.sender, trade.tokenAmount);

        // Chuyển đồng LKK từ sàn cho người bán
        lkkToken.transfer(trade.seller, trade.lkkPrice);

        emit TradeCompleted(_tradeId, trade.seller, msg.sender, trade.tokenAmount, trade.lkkPrice, trade.tokenAddresses);
        
        // Lưu trữ thông tin giao dịch vào mảng tradeHistory
        tradeHistory.push(TradeHistory(msg.sender, trade.seller, trade.tokenAmount, trade.lkkPrice, trade.tokenAddresses, block.timestamp));

        delete trades[_tradeId];
    }

    function getTradeHistory() public view returns (address[] memory buyers, address[] memory sellers, uint256[] memory tokenAmounts, uint256[] memory lkkPrices, address[] memory tokenAddresses, uint256[] memory timestamps) {
        buyers = new address[](tradeHistory.length);
        sellers = new address[](tradeHistory.length);
        tokenAmounts = new uint256[](tradeHistory.length);
        lkkPrices = new uint256[](tradeHistory.length);
        tokenAddresses = new address[](tradeHistory.length);
        timestamps = new uint256[](tradeHistory.length);

        for (uint256 i = 0; i < tradeHistory.length; i++) {
            buyers[i] = tradeHistory[i].buyer;//Gán địa chỉ người mua từ giao dịch vào mảng 
            sellers[i] = tradeHistory[i].seller;//Gán địa chỉ người bán từ giao dịch vào mảng
            tokenAmounts[i] = tradeHistory[i].tokenAmount;//Gán lượng token QTK được giao dịch từ giao dịch vào mảng
            lkkPrices[i] = tradeHistory[i].lkkPrice;// Gán giá của token LKK từ giao dịch vào mảng
            tokenAddresses[i] = tradeHistory[i].tokenAddresses;
            timestamps[i] = tradeHistory[i].timestamp;
        }

        return (buyers, sellers, tokenAmounts, lkkPrices, tokenAddresses, timestamps);
    }

    function cancelTrade(uint256 _tradeId) external {
        require(_tradeId < trades.length, "Invalid trade id");
        require(trades[_tradeId].seller == msg.sender, "Only the seller can cancel the trade");

        IERC20 tokenContract = IERC20(trades[_tradeId].tokenAddresses);
        
        // Chuyển số HTK từ smart contract Exchange về người bán
        tokenContract.transfer(trades[_tradeId].seller, packageAmounts[_tradeId]);

        // Xoá thông tin gói HTK từ mapping packageAmounts
        delete packageAmounts[_tradeId];

        // Xoá giao dịch từ mảng trades
        delete trades[_tradeId];

        // Gửi sự kiện thông báo rút gói thành công
        emit TradeCancelled(_tradeId, trades[_tradeId].seller);
    }

        // Hàm tìm kiếm các gói bán của một token đã chọn
        function findTradesByToken(address token) public view returns (uint256[] memory tradeIds, address[] memory sellers, uint256[] memory tokenAmounts, uint256[] memory lkkPrices) {
            uint256 count = 0;
            // Đếm số lượng gói bán của token đã chọn
            for (uint256 i = 0; i < trades.length; i++) {
                if (trades[i].tokenAddresses == token) {
                    count++;
                }
            }

            // Khởi tạo các mảng kết quả với kích thước đã biết trước
            tradeIds = new uint256[](count);
            sellers = new address[](count);
            tokenAmounts = new uint256[](count);
            lkkPrices = new uint256[](count);

            uint256 index = 0;
            // Lấy thông tin các gói bán của token đã chọn
            for (uint256 i = 0; i < trades.length; i++) {
                if (trades[i].tokenAddresses == token) {
                    tradeIds[index] = i;
                    sellers[index] = trades[i].seller;
                    tokenAmounts[index] = trades[i].tokenAmount;
                    lkkPrices[index] = trades[i].lkkPrice;
                    index++;
                }
            }

            return (tradeIds, sellers, tokenAmounts, lkkPrices);
        }

}

contract LKK {
    string public name;
    string public symbol;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        name = "LunKidToken";
        symbol = "LKK";
        totalSupply = 1000000;
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}