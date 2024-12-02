const hre = require("hardhat");

async function main() {
    const SocialMedia = await hre.ethers.getContractFactory("SocialMedia");
    const socialMedia = await SocialMedia.deploy();
    await socialMedia.deployed();
    console.log("SocialMedia contract deployed to:", socialMedia.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
