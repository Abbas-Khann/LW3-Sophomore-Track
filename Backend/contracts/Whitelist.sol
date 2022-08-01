// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Import this file to use console.log
import "hardhat/console.sol";

contract Whitelist {
    // Max number of whitelisted Addresses allowed
    uint8 public maxWhiteListedAddresses;

    // Create a mapping of whitelistedAddresses
    // if an address is whitelisted, we would set it to true, it is false by default for all other addresses
    mapping(address => bool) public whitelistedAddresses;

    // numAddressesWhitelisted would be used to keep track of how many addresses have been whitelisted
    // Note: Don't change the variable name, it will be part of verification
    uint8 public numAddressesWhitelisted;

    // Setting the max number of whitelistedAddresses
    // User will put the time of the value at the time of deployment
    constructor(uint8 _maxWhitelistedAddressses) {
        maxWhiteListedAddresses = _maxWhitelistedAddressses;
    }

    function addAddressToWhitelist() public {
        // check if the user has already been whitelisted
        require(!whitelistedAddresses[msg.sender], "Sender has already been whitelisted!");
        // check if the number of whitelisted addresses is less than maximum whitelisted addresses, Otherwise throw an error
        require(numAddressesWhitelisted < maxWhiteListedAddresses, "Maximum limit reached!");

        whitelistedAddresses[msg.sender] = true;
        // Increase the number of whitelisted addresses
        numAddressesWhitelisted += 1;

    }

}
