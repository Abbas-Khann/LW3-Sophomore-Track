// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract FakeNFTMarketPlace {

    mapping(uint256 => address) public tokens;

    uint256 nftPrice = 0.1 ether;

    function purchase(uint256 _tokenId) external payable {
        require(msg.value == nftPrice, "You broke bitch! This NFT requires 0.1 ether!");
        tokens[_tokenId] = msg.sender;
    }

    function getPrice() external view returns(uint256) {
        return nftPrice;
    }

    function available(uint256 _tokenId) external view returns(bool) {
        if(tokens[_tokenId] == address(0)) {
            return true;
        }
        return false;
    }

}