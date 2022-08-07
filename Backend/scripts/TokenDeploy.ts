// const { ethers } = require("hardhat")
require("dotenv").config({ path: "../.env" });
// const { NFT_CONTRACT_ADDRESS } = require("../Constants/constants");

const Mainn = async (): Promise <any> => {
    const KhaNFTContract =  NFT_CONTRACT_ADDRESS;

    const KHANFT_TOKEN = await ethers.getContractFactory("KhaNFTtoken");

    const deployedKhaNFTtoken = await KHANFT_TOKEN.deploy(
        KhaNFTContract
    );

    console.log("KhaNFT TOKEN CONTRACT ADDRESS :",
                 deployedKhaNFTtoken.address
               );

}

Mainn().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });