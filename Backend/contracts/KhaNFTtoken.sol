// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IKhaNFT.sol";

contract KhaNFTtoken is ERC20, Ownable {
    uint256 public constant tokenPrice = 0.001 ether;

    uint256 public constant tokensPerNFT = 10 * 10**18;

    uint256 public constant maxTotalSupply = 10000 * 10**18;

    IKhaNFT KhaNFT;

    mapping (uint256 => bool) public tokenIdsClaimed;

    constructor(address _KhaNFTContract) ERC20("KhaNFTtoken", "AK") {
        KhaNFT = IKhaNFT(_KhaNFTContract);
    }

    function mint(uint256 amount) public payable {
        uint256 _requiredAmount = tokenPrice * amount;
        require(msg.value >= _requiredAmount, "Not enough money!!!");
        uint256 _amountWithDecimals = amount * 10**18;
        require(
            (totalSupply() + _amountWithDecimals) <= maxTotalSupply,
            "Exceeds the maximum total supply available!"
        );
        _mint(msg.sender, _amountWithDecimals);
    }

    function claim() public {
        address sender = msg.sender;

        uint256 balance = KhaNFT.balanceOf(sender);

        require(balance > 0, "You don't own any KhaNFTs");

        uint256 amount = 0;

        for (uint i = 0; i < balance; i++) {
            uint256 tokenId = KhaNFT.tokenOfOwnerByIndex(sender, i);

            if (!tokenIdsClaimed[tokenId]) {
                amount++;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        require(amount > 0, "You have already claimed all the tokens!");
        _mint(msg.sender, amount * tokensPerNFT);
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether!");
    }

    receive() external payable {}
    fallback() external payable {}

}