// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount; // the account that receives exchange fees
    uint256 public feePercent; // the fee percentage
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public cancelledOrders;
    uint256 public orderCount;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event Order(
        uint256 id,
        address user,
        address sell,
        uint256 sellAmount,
        address buy,
        uint256 buyAmount,
        uint256 timestamp
    );
    event Cancelled(
        uint256 id,
        address user,
        address sell,
        uint256 sellAmount,
        address buy,
        uint256 buyAmount,
        uint256 timestamp
    );

    struct _Order {
        uint256 id;
        address user;
        address sell;
        uint256 sellAmount;
        address buy;
        uint256 buyAmount;
        uint256 timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Deposit Tokens
    function depositToken(address _token, uint256 _amount) public {
        // Transfer tokens to exchange.
        Token(_token).transferFrom(msg.sender, address(this), _amount);

        // Update balance. Zero by default.
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        // Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        // Check balance
        require(tokens[_token][msg.sender] >= _amount, "Insufficient balance");

        // Transfer tokens to exchange.
        Token(_token).transfer(msg.sender, _amount);

        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Check Balances
    function checkBalance(address _token, address _user)
        public
        view
        returns (uint256)
    {
        return tokens[_token][_user];
    }

    // Make Order
    function makeOrder(
        address _tokenSell,
        uint256 _tokenSellAmount,
        address _tokenBuy,
        uint256 _tokenBuyAmount
    ) public {
        require(
            checkBalance(_tokenSell, msg.sender) >= _tokenSellAmount,
            "Insufficient balance"
        );

        orderCount = orderCount + 1;

        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenSell,
            _tokenSellAmount,
            _tokenBuy,
            _tokenBuyAmount,
            block.timestamp
        );

        emit Order(
            orderCount,
            msg.sender,
            _tokenSell,
            _tokenSellAmount,
            _tokenBuy,
            _tokenBuyAmount,
            block.timestamp
        );
    }

    // Cancel Order
    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(address(_order.user) == msg.sender, "Unauthorized");
        require(_order.id == _id, "Invalid order");

        cancelledOrders[_id] = true;

        _order.id = 0;

        emit Cancelled(
            _order.id,
            msg.sender,
            _order.sell,
            _order.sellAmount,
            _order.buy,
            _order.buyAmount,
            block.timestamp
        );
    }
}
