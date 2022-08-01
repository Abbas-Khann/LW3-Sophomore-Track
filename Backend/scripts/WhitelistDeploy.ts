const { ethers } = require("hardhat");

const main = async () => {
  const whitelistContract = await ethers.getContractFactory("Whitelist");

  const deployedWhitelistedContract = await whitelistContract.deploy();

  await deployedWhitelistedContract.deployed();

  console.log("Deployed Contract Address: ",
               deployedWhitelistedContract.address
            );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
