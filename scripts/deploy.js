const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const Contract = await hre.ethers.getContractFactory("Twit_contractor");

  // Deploy contract
  const contract = await Contract.deploy();

  // Wait for deployment to finish
  await contract.waitForDeployment();

  // Get the deployed address
  console.log("Twit_contractor deployed to:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
