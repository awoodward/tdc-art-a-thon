async function main() {
    const [deployer] = await ethers.getSigners();
    // Change these to valid addresses
    const addrAdmin = ethers.utils.getAddress("0x0000000000000000000000000000000000000000")
    const addrMinter = ethers.utils.getAddress("0x0000000000000000000000000000000000000000")
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const factory = await ethers.getContractFactory("TDCArtaThonLtdEd");
    const token = await factory.deploy();
    console.log("Contract address:", token.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });