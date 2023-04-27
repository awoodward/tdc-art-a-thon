const { expect } = require("chai");
const { ethers } = require("hardhat");
//const { beforeEach } = require("mocha"); *** Don't use this when using Chai and Hardhat
const { Contract, BigNumber } = require("ethers");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
const { delay } = require("bluebird");
//const { parseEther, getAddress } = ethers.utils;

describe("TDCArtaThonLtdEd", () => {
    let artaThonLtdEdContract;
    let owner;
    let address1;
    let address2;
    let address3;

    beforeEach(async () => {
        const TDCArtaThonLtdEdFactory = await ethers.getContractFactory(
            "TDCArtaThonLtdEd"
        );
        [owner, address1, address2, address3] = await ethers.getSigners();
        artaThonLtdEdContract = await TDCArtaThonLtdEdFactory.deploy(
        );
    });

    it("Should initialize the Art-a-Thon Limited Edition contract", async () => {
        expect(await artaThonLtdEdContract.totalSupply()).to.equal(0);
        // Check ERC721 Interface
        expect(await artaThonLtdEdContract.supportsInterface(0x80ac58cd)).to.equal(true);
        // Check ERC2981 Interface
        //expect(await pickandmintContract.supportsInterface(0x2a55205a)).to.equal(true);
    });

    it("Should emit on increment", async () => {
        await expect(
            artaThonLtdEdContract.incrementTotalSupply(1)
        )
            .to.emit(artaThonLtdEdContract, "Transfer")
            .withArgs(ethers.constants.AddressZero, owner.address, 0); // this is actually a mint in this case
    });

    it("Should mint tokens", async () => {
        await expect(
            artaThonLtdEdContract.transferFrom(address1.address, address2.address, 0)
        )
            .to.be.revertedWith("Invalid token Id");

        await artaThonLtdEdContract.incrementTotalSupply(500);
        expect(await artaThonLtdEdContract.totalSupply()).to.equal(500);

        let tokenId = await artaThonLtdEdContract.totalSupply();
        await expect(
            artaThonLtdEdContract.transferFrom(address1.address, address2.address, 0)
        )
            .to.be.revertedWith("Caller is not token owner or approved for all");

        await expect(
            artaThonLtdEdContract.transferFrom(owner.address, address2.address, 0)
        )
            .to.emit(artaThonLtdEdContract, "Transfer")
            .withArgs(ethers.constants.AddressZero, address2.address, 0); // this is actually a mint in this case
    });

    it("Should handle admin settings", async () => {
        await artaThonLtdEdContract.incrementTotalSupply(1);
        expect(await artaThonLtdEdContract.totalSupply()).to.equal(1);
        // Check approval
        await artaThonLtdEdContract.setApprovalForAll(address2.address, true);
        expect(await artaThonLtdEdContract.isApprovedForAll(owner.address, address2.address)).to.equal(true);
        expect(await artaThonLtdEdContract.isApprovedForAll(owner.address, address3.address)).to.equal(false);
        // Test default URI
        expect(await artaThonLtdEdContract.tokenURI(0)).to.equal("");
        // change base URI and try again
        await artaThonLtdEdContract.setBaseURI("foo/");
        expect(await artaThonLtdEdContract.tokenURI(0)).to.equal("foo/0.json");
        // Test default contract URI
        expect(await artaThonLtdEdContract.contractURI()).to.equal("");
        // Test contract metadata URI:
        await artaThonLtdEdContract.setContractURI("foobar.json");
        expect(await artaThonLtdEdContract.contractURI()).to.equal("foobar.json");
        // Royalties
        await artaThonLtdEdContract.setRoyalty(address1.address, 500);

        const info = await artaThonLtdEdContract.royaltyInfo(0, 100000);
            expect(info[1].toNumber()).to.be.equal(5000);
            expect(info[0]).to.be.equal(address1.address);
    });

    it("Should handle artist settings", async () => {
        await artaThonLtdEdContract.incrementTotalSupply(10);
        expect(await artaThonLtdEdContract.totalSupply()).to.equal(10);
        // Set artist token
        await artaThonLtdEdContract.setTokenArtist(0, 9, address3.address);
        expect(await artaThonLtdEdContract.tokenArtists(2)).to.equal(address3.address);
    });

    it("Should transfer contract ownership", async () => {
        await expect(
            artaThonLtdEdContract.transferOwnership(address1.address)
        )
            .to.emit(artaThonLtdEdContract, "OwnershipTransferred")
            .withArgs(owner.address, address1.address);
    });
});