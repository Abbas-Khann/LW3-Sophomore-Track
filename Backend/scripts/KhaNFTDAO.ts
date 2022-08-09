// const { ethers } = require("hardhat");

const { NFT_CONTRACT_ADDRESS } = require("../Constants/constants");

const Mainnn =async (): Promise <void> => {
    const FakeNFTMarketPlace = await ethers.getContractFactory("FakeNFTMarketPlace");

    const fakeNFTMarketPlace = await FakeNFTMarketPlace.deploy();

    await fakeNFTMarketPlace.deployed();

    console.log("FakeNFT MarketPlace Deployed to: ", fakeNFTMarketPlace.address);

    const KhaNFTDAO = await ethers.getContractFactory("KhaNFTDAO");

    const deployedKhaNFTDAO = await KhaNFTDAO.deploy(
        fakeNFTMarketPlace.address,
        NFT_CONTRACT_ADDRESS, 
        {
            value: ethers.utils.parseEther("0.01"),
        }
    );

    await deployedKhaNFTDAO.deployed();

    console.log("DAO CONTRACT ADDRESS: ", deployedKhaNFTDAO.address);
}

Mainnn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

