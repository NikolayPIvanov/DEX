// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "hardhat/console.sol";

// ERC-20 Token Standard: https://eips.ethereum.org/EIPS/eip-20
contract Token {
    string public name;
    string public symbol;
    uint256 public decimals;
    uint256 public totalSupply;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _decimals,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * (10**_decimals);

        console.log(
            "Deploying a Token with name %s symbol %s and %s decimals",
            name,
            symbol,
            decimals
        );
    }
}
