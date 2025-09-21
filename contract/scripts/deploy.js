const hre = require("hardhat");

async function main() {
  console.log("Deploying StartBidAuction contract...");

  const StartBidAuction = await hre.ethers.getContractFactory("StartBidAuction");
  const startBidAuction = await StartBidAuction.deploy();

  await startBidAuction.waitForDeployment();

  console.log("StartBidAuction deployed to:", await startBidAuction.getAddress());
  console.log("Contract owner:", await startBidAuction.owner());
  console.log("Platform fee:", await startBidAuction.platformFeeBasisPoints(), "basis points");

  // Verify contract on Etherscan if not on local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await startBidAuction.deployTransaction.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: await startBidAuction.getAddress(),
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  return startBidAuction;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
