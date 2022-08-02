async function main() {
    const [deployer] = await ethers.getSigners();
    // Change these to valid addresses
    const addrAdmin = ethers.utils.getAddress("0x0000000000000000000000000000000000000000")
    const addrMinter = ethers.utils.getAddress("0x0000000000000000000000000000000000000000")

    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const ArtatthonFactory = await ethers.getContractFactory("TDCArtaThon");
    const tokenArtaThon = await ArtatthonFactory.deploy();
    console.log("Art-a-Thon contract address:", tokenArtaThon.address);

    const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));

    console.log("Setting contract role permissions")

    await tokenArtaThon.grantRole(MINTER_ROLE, addrMinter);
    await tokenArtaThon.addAdmin(addrAdmin);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });