// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import './IWhitelist.sol';

contract KhaNFT is ERC721Enumerable, Ownable {
    string _baseTokenURI;

    uint256 public _price = 0.01 ether;

    bool public _paused;

    uint256 public maxTokenIds = 20;

    uint256 public tokenIds;

    IWhitelist whitelist;

    bool public presaleStarted;

    uint256 public presaleEnded;

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused!!!");
        _;
    }

    constructor (string memory baseURI, address whitelistContract) ERC721 ("KhaNFT", "AK") {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEnded = block.timestamp + 2 minutes;
    }

    function presaleMint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp < presaleEnded, "Presale is not active right now!");
        require(whitelist.whitelistedAddresses(msg.sender), "You are not whitelisted!");
        require(tokenIds < maxTokenIds, "Exceeded maximum KhaNFT supply!");
        require(msg.value >= _price, "Not enough money!!!");
        tokenIds++;
        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet!");
        require(tokenIds < maxTokenIds, "Exceeded maximum AK supply!");
        require(msg.value >= _price, "Ether sent is not enough!!!");
        tokenIds++;
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view virtual override returns(string memory) {
        return _baseTokenURI;
    }

    function setPaused(bool value) public onlyOwner {
        _paused = value;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent,) = _owner.call{value: amount}("");
        require(sent, "Failed to send!!!");
    }

    receive() external payable {}
    fallback() external payable {}
}