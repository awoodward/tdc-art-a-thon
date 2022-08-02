const { expect } = require("chai");
const { ethers } = require("hardhat");
//const { beforeEach } = require("mocha"); *** Don't use this when using Chai and Hardhat
const { Contract, BigNumber } = require("ethers");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
const { delay } = require("bluebird");
//const { parseEther, getAddress } = ethers.utils;

describe("TDC Art-a-Thon", () => {
    let artathonContract;
    let owner;
    let address1;
    let address2;
    let address3;

    beforeEach(async () => {
        const ArtatthonFactory = await ethers.getContractFactory(
            "TDCArtaThon"
        );
        [owner, address1, address2, address3] = await ethers.getSigners();
        artathonContract = await ArtatthonFactory.deploy(
        );
    });

    it("Should initialize the Art-a-Thon contract", async () => {
        expect(await artathonContract.totalSupply()).to.equal(0);
        // Check ERC721 Interface
        expect(await artathonContract.supportsInterface(0x80ac58cd)).to.equal(true);
        // Check ERC2981 Interface
        expect(await artathonContract.supportsInterface(0x2a55205a)).to.equal(true);
    });

    it("Should mint art-a-thon tokens", async () => {
        const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
        let tokenId = await artathonContract.totalSupply();
        /*
        // Test Mint permissions
        await expect(artathonContract.safeMint(address1.address))
            .to.be.revertedWith("Only addresses with minter role can perform this action.");
        // Grant Minter Role
        await artathonContract.grantRole(MINTER_ROLE, owner.address);
        */
        // Mint to address 1
        expect(
            await artathonContract.safeMint(address1.address)
        )
            .to.emit(artathonContract, "Transfer")
            .withArgs(ethers.constants.AddressZero, address1.address, tokenId);
        // Transfer to address 2
        console.log("mint #1 transfer");
        expect(
            await artathonContract.connect(address1).transferFrom(address1.address, address2.address, tokenId)
        )
            .to.emit(artathonContract, "Transfer")
            .withArgs(address1.address, address2.address, tokenId);

        tokenId++
        // Mint to address 2
        expect(
            await artathonContract.safeMint(address2.address)
        )
            .to.emit(artathonContract, "Transfer")
            .withArgs(ethers.constants.AddressZero, address2.address, tokenId);

        // test out of bounds token
        await expect(artathonContract.tokenURI(tokenId + 1))
            .to.be.revertedWith("Art-a-Thon token does not exist");

        // Test default URI
        expect(await artathonContract.tokenURI(1)).to.equal("");
        // change base URI and try again
        await artathonContract.setBaseURI("foo/");
        expect(await artathonContract.tokenURI(1)).to.equal("foo/1.json");
        // Test default contract URI
        expect(await artathonContract.contractURI()).to.equal("");
        // Test contract metadata URI:
        await artathonContract.setContractURI("foobar.json");
        expect(await artathonContract.contractURI()).to.equal("foobar.json");

        // Test mint with Artist
       tokenId++
       expect(
            await artathonContract.mintArt(address2.address, address1.address)
        )
            .to.emit(artathonContract, "Transfer")
            .withArgs(ethers.constants.AddressZero, address1.address, tokenId);
        // Check tokenID for artist
        expect(await artathonContract.tokenArtists(tokenId)).to.equal(address2.address);
        // Set artist token
        await artathonContract.setTokenArtist(tokenId, address3.address);
        expect(await artathonContract.tokenArtists(tokenId)).to.equal(address3.address);
        // Royalties
        await artathonContract.setRoyalty(address1.address, 500);

        const info = await artathonContract.royaltyInfo(tokenId, 100000);
            expect(info[1].toNumber()).to.be.equal(5000);
            expect(info[0]).to.be.equal(address1.address);
    });

    it("Should transfer contract ownership", async () => {
        expect(
            await artathonContract.transferOwnership(address1.address)
        )
            .to.emit(artathonContract, "OwnershipTransferred")
            .withArgs(owner.address, address1.address);
    });
});