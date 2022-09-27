// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "hardhat/console.sol";

// ERC-20 Token Standard: https://eips.ethereum.org/EIPS/eip-20
contract Token {
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Track Balances
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Send Tokens
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;

        console.log(
            "Deploying a Token with name %s symbol %s and %s decimals",
            name,
            symbol,
            decimals
        );
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(
            balanceOf[msg.sender] >= _value,
            "ERC20: transfer amount exceeds balance"
        );
        require(_to != address(0), "ERC20: transfer to the zero address");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        require(_spender != address(0), "ERC20: approve to the zero address");
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(
            balanceOf[_from] >= _value,
            "ERC20: transfer amount exceeds balance"
        );
        require(
            allowance[_from][msg.sender] >= _value,
            "ERC20: transfer amount exceeds allowance"
        );
        require(_to != address(0), "ERC20: transfer to the zero address");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}
