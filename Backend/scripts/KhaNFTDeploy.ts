const { ethers } = require("hardhat");
require("dotenv").config({ path: "../.env" });
import { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } from "../Constants/constants";

const Main = async(): Promise<any> => {

    const WhitelistContract = WHITELIST_CONTRACT_ADDRESS;

    const metadataURL = METADATA_URL;

    const KhaNFTContract = await ethers.getContractFactory("KhaNFT");

    const deployedKhaNFTContract = await KhaNFTContract.deploy();

    await deployedKhaNFTContract.deployed();

    console.log("KhaNFT Contract address:"
            ,deployedKhaNFTContract.address
            );
}

Main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  