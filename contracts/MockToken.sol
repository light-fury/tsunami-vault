// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Mock ERC20 Token
 * @dev Only for test purpose
 */

contract MockToken is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        _mint(_msgSender(), 10000000 * 10 ** 18);
    }
}