async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
  
    const AuthenTick = await ethers.getContractFactory("AuthenTick");
    const authenTick = await AuthenTick.deploy();
    await authenTick.deployed();
  
    console.log("AuthenTick deployed to:", authenTick.address);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });