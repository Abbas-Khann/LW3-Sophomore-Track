const { ethers } = require("hardhat");
require("dotenv").config({ path: "../.env" });

const { KHANFT_TOKEN_CONTRACT_ADDRESS } = require("../Constants/constants");

async function func(): Promise <void> {

    const khaNFTTokenAddress = KHANFT_TOKEN_CONTRACT_ADDRESS;

    const exchangeContract = await ethers.getContractFactory("DEX");

    const deployedExchangeContract = await exchangeContract.deploy(
        khaNFTTokenAddress
    );

    await deployedExchangeContract.deployed();

    console.log("DEX CONTRACT ADDRESS: ",
    deployedExchangeContract.address
    );

}

func()
.then(() => process.exit(0))
.catch((err: any) => {
    console.error(err);
    process.exit(1);
  });