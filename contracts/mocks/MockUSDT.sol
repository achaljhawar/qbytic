// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDT is ERC20, Ownable {
    uint8 private _decimals;

    constructor() ERC20("Tether USD", "USDT") Ownable(msg.sender) {
        _decimals = 6; // USDT has 6 decimals
        _mint(msg.sender, 1000000 * 10**_decimals); // Mint 1M USDT to deployer
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function faucet(uint256 amount) external {
        require(amount <= 10000 * 10**_decimals, "Amount too large for faucet");
        _mint(msg.sender, amount);
    }
}