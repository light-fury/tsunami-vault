import { expect } from "chai";
import { ethers } from "hardhat";
import { ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";


describe("Vault", function () {
  let Vault: ContractFactory;
  let vault: any;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let user: SignerWithAddress;
  let token: any;

  beforeEach(async function () {
    [owner, admin, user] = await ethers.getSigners();
    Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy();
    
    // Deploy a simple ERC-20 token for testing
    const Token = await ethers.getContractFactory("MockToken");
    token = await Token.deploy("MockToken", "MT");
    
    // Add an admin role
    await vault.addAdmin(admin.address);
  });

  it("Should deposit and withdraw tokens", async function () {
    // Whitelist the token
    await vault.connect(admin).whitelistToken(token.target);

    // Transfer some tokens to the user
    await token.transfer(user.address, ethers.parseEther("100"));
    
    // Approve the vault to spend tokens on behalf of the user
    await token.connect(user).approve(vault.target, ethers.parseEther("50"));

    // User deposits tokens into the vault
    await vault.connect(user).deposit(token.target, ethers.parseEther("50"));

    // Check if the vault balance is correct
    expect(await token.balanceOf(vault.target)).to.equal(ethers.parseEther("50"));

    // Check if the balance of the user inside vault is correct
    expect(await vault.balances(token.target, user.address)).to.equal(ethers.parseEther("50"));

    // User withdraws tokens from the vault
    await vault.connect(user).withdraw(token.target, ethers.parseEther("20"));

    // Check if the vault balance is updated after withdrawal
    expect(await token.balanceOf(vault.target)).to.equal(ethers.parseEther("30"));

    // Check if the balance of the user inside vault is correct
    expect(await vault.balances(token.target, user.address)).to.equal(ethers.parseEther("30"));
  });

  it("Should pause and unpause the contract", async function () {
    // Only admin should be able to pause the contract
    await expect(vault.connect(user).pause()).to.be.revertedWithCustomError(vault, "AccessControlUnauthorizedAccount");
    await vault.connect(admin).pause();
    expect(await vault.paused()).to.be.true;

    // Only admin should be able to unpause the contract
    await expect(vault.connect(user).unpause()).to.be.revertedWithCustomError(vault, "AccessControlUnauthorizedAccount");
    await vault.connect(admin).unpause();
    expect(await vault.paused()).to.be.false;
  });

  it("Should whitelist and remove token from whitelist", async function () {
    // Only admin should be able to whitelist a token
    await expect(vault.connect(user).whitelistToken(token.target)).to.be.revertedWithCustomError(vault, "AccessControlUnauthorizedAccount");
    await vault.connect(admin).whitelistToken(token.target);
    expect(await vault.whitelistedTokens(token.target)).to.be.true;

    // Only admin should be able to remove a token from the whitelist
    await expect(vault.connect(user).removeTokenFromWhitelist(token.target)).to.be.revertedWithCustomError(vault, "AccessControlUnauthorizedAccount");
    await vault.connect(admin).removeTokenFromWhitelist(token.target);
    expect(await vault.whitelistedTokens(token.target)).to.be.false;
  });

  it("Should add and remove an admin", async function () {
    // Only owner should be able to add an admin
    await expect(vault.connect(user).addAdmin(user.address)).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    await vault.connect(owner).addAdmin(user.address);
    expect(await vault.hasRole(await vault.ADMIN_ROLE(), user.address)).to.be.true;

    // Only owner should be able to remove an admin
    await expect(vault.connect(user).removeAdmin(user.address)).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    await vault.connect(owner).removeAdmin(user.address);
    expect(await vault.hasRole(await vault.ADMIN_ROLE(), user.address)).to.be.false;
  });
});