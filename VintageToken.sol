// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VintageToken is ERC20, Ownable {
    
    // Constructor: Sets the name "VintageLoyalty" and symbol "VLT"
    // Mints 1,000,000 tokens to the creator immediately
    constructor() ERC20("VintageLoyalty", "VLT") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /**
     * @dev Function to reward users (Minting new tokens).
     * Can be called by the Marketplace contract or the Admin manually.
     */
    function rewardUser(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}