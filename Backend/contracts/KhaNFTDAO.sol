// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFakeNFTMarketplace {
    function purchase(uint256 _tokenId) external payable;
    function getPrice() external view returns (uint256);
    function available(uint256 _tokenId) external view returns(bool);  
}

interface IKhaNFT {
    function balanceOf(address owner) external view returns(uint);

    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns(uint256);
}

contract KhaNFTDAO is Ownable {
    struct Proposal {
        uint256 nftTokenId;

        uint256 deadline;

        uint256 yayVotes;
        uint256 nayVotes;
        bool executed;
        mapping(uint256 => bool) voters;
    }

    mapping(uint256 => Proposal) public proposals;

    uint256 public numProposals;

    IFakeNFTMarketplace nftMarketplace;
    IKhaNFT khaNFT;

    constructor(address _nftMarketplace, address _khaNFT) payable {
        nftMarketplace = IFakeNFTMarketplace(_nftMarketplace);
        khaNFT = IKhaNFT(_khaNFT);
    }

    modifier nftHolderOnly {
        require(khaNFT.balanceOf(msg.sender) > 0, "THIS_BITCH_IS_NOT_A_DAO_MEMBER");
        _;
    }

    function createProposal(uint256 _nftTokenId) external nftHolderOnly returns(uint256) {
        require(nftMarketplace.available(_nftTokenId), "NFT_NOT_FOR_SALE_DUMMY!");

        Proposal storage proposal = proposals[numProposals];
        proposal.nftTokenId = _nftTokenId;
        proposal.deadline = block.timestamp + 4 minutes;
        numProposals++;
        return numProposals - 1;
    }

    modifier activeProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline > block.timestamp,
            "Deadline Exceeded Dummy!!!"
        );
        _;
    }

    enum Vote {
        YAY, // YAY = 0
        NAY // NAY = 1
    }

    function voteOnProposal(uint256 proposalId, Vote vote)
    external 
    nftHolderOnly
    activeProposalOnly(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];

        uint256 voterNFTBalance = khaNFT.balanceOf(msg.sender);

        uint256 numVotes;

        for (uint256 i = 0; i < voterNFTBalance; i++) {
            uint256 tokenId = khaNFT.tokenOfOwnerByIndex(msg.sender, i);
            if(proposal.voters[tokenId] == false) {
                numVotes++;
                proposal.voters[tokenId] = true;
            }
        }

        require(numVotes > 0, "ALREADY_VOTED");

        if(vote == Vote.YAY) {
            proposal.yayVotes += numVotes;
        }
        else {
            proposal.nayVotes += numVotes;
        }

    }

    modifier inactiveProposalOnly(uint256 proposalIndex) {
        require(proposals[proposalIndex].deadline <= block.timestamp,
        "Deadline not exceeded"
        );

        require(proposals[proposalIndex].executed == false
        ,
        "Proposal already Executed!!!");
        _;
    }


    function executeProposal(uint256 proposalIndex)
    external
    nftHolderOnly
    inactiveProposalOnly(proposalIndex)
    {
        Proposal storage proposal = proposals[proposalIndex];

        if(proposal.yayVotes > proposal.nayVotes) {
            uint256 nftPrice = nftMarketplace.getPrice();
            require(address(this).balance >= nftPrice, "NOT_ENOUGH FUNDS!!!");
            nftMarketplace.purchase{value: nftPrice}(proposal.nftTokenId);
        }
        proposal.executed = true;
    }

    function withdrawEther() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
    fallback() external payable {}

}