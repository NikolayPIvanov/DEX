// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

import "hardhat/console.sol";

// ERC-20 Token Standard: https://eips.ethereum.org/EIPS/eip-20
contract Token {
    string _name = "My Token";

    function name() public view returns (string memory) {
        return _name;
    }
}
