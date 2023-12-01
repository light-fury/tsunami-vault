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
  let user2: SignerWithAddress;
  let token: any;
  let token2: any;
  let token3: any;

  beforeEach(async function () {
    [owner, admin, user, user2] = await ethers.getSigners();
    Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy();
    
    // Deploy a simple ERC-20 token for testing
    const Token = await ethers.getContractFactory("MockToken");
    token = await Token.deploy("MockToken", "MT");
    token2 = await Token.deploy("MockToken2", "MT22");

    // Deploy an invalid token
    const MockInvalidToken = await ethers.getContractFactory("MockInvalidToken");
    token3 = await MockInvalidToken.deploy();
  });

  // Integration Test
  it("Should deposit and withdraw tokens", async function () {
    // Add an admin role
    await vault.addAdmin(admin.address);

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

  // Admin Actions
  it("Should pause and unpause the contract", async function () {
    // Add an admin role
    await vault.addAdmin(admin.address);

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
    // Add an admin role
    await vault.addAdmin(admin.address);

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

  describe("Deposit / Withdraw Operations with Single User & Single Token", function () {
    beforeEach(async function () {
      // Add an admin role
      await vault.addAdmin(admin.address);

      // Whitelist the token
      await vault.connect(admin).whitelistToken(token.target);
    });

    it('Should deposit and withdraw tokens', async function () {
      // Transfer some tokens to the user
      await token.transfer(user.address, ethers.parseEther('100'));
  
      // Approve the vault to spend tokens on behalf of the user
      await token.connect(user).approve(vault.target, ethers.parseEther('50'));
  
      // User deposits tokens into the vault
      await vault.connect(user).deposit(token.target, ethers.parseEther('50'));
  
      // Check if the vault balance is correct
      expect(await token.balanceOf(vault.target)).to.equal(ethers.parseEther('50'));
  
      // User withdraws tokens from the vault
      await vault.connect(user).withdraw(token.target, ethers.parseEther('25'));
  
      // Check if the vault balance is updated after withdrawal
      expect(await token.balanceOf(vault.target)).to.equal(ethers.parseEther('25'));
    });
  
    it('Should fail if pasued', async function () {
      // Pause the vault
      await vault.connect(admin).pause();

      // Transfer some tokens to the user
      await token.transfer(user.address, ethers.parseEther('100'));
  
      // Approve the vault to spend tokens on behalf of the user
      await token.connect(user).approve(vault.target, ethers.parseEther('50'));
  
      // Attempt to deposit when paused
      await expect(vault.connect(user).deposit(token.target, ethers.parseEther('50'))).to.be.revertedWithCustomError(vault, "EnforcedPause");
      // Attempt to deposit when paused
      await expect(vault.connect(user).withdraw(token.target, ethers.parseEther('50'))).to.be.revertedWithCustomError(vault, "EnforcedPause");
    });
  
    it('Should fail with not whitelisted token', async function () {
      // Transfer some tokens to the user
      await token.transfer(user.address, ethers.parseEther('50'));
  
      // Approve the vault to spend tokens on behalf of the user
      await token.connect(user).approve(vault.target, ethers.parseEther('50'));
  
      // Attempt to deposit with a not whitelisted token
      await expect(vault.connect(user).deposit(token2.target, ethers.parseEther('50'))).to.be.revertedWithCustomError(vault, "TokenNotWhitelisted");

      // Attempt to deposit with a not whitelisted token
      await expect(vault.connect(user).withdraw(token2.target, ethers.parseEther('50'))).to.be.revertedWithCustomError(vault, "TokenNotWhitelisted");
    });
  
    it('Should fail with non erc20 token', async function () {
      // Whitelist the token
      await vault.connect(admin).whitelistToken(token3.target);
  
      // Attempt to deposit with a not whitelisted token
      await expect(vault.connect(user).deposit(token3.target, ethers.parseEther('50'))).to.be.revertedWithCustomError(vault, "FailedInnerCall");
    });
  
    it('Should fail with insufficient balance', async function () {
      // Transfer some tokens to the user
      await token.transfer(user.address, ethers.parseEther('100'));

      // Approve the vault to spend tokens on behalf of the user
      await token.connect(user).approve(vault.target, ethers.parseEther('100'));

      // User deposits tokens into the vault
      await vault.connect(user).deposit(token.target, ethers.parseEther('100'));

      // User attempts to deposit more tokens than they have
      await expect(vault.connect(user).withdraw(token.target, ethers.parseEther('101'))).to.be.revertedWithCustomError(vault, "InsufficientBalance");
    });
  })

  it("Deposit / Withdraw Operations with Multiple Users & Multiple Tokens", async function () {
    // Add an admin role
    await vault.addAdmin(admin.address);
    
    // Whitelist the tokens
    await vault.connect(admin).whitelistToken(token.target);
    await vault.connect(admin).whitelistToken(token2.target);
    // Transfer some tokens to the users
    await token.transfer(user.address, ethers.parseEther('50'));
    await token2.transfer(user2.address, ethers.parseEther('75'));

    // Approve the vault to spend tokens on behalf of the users
    await token.connect(user).approve(vault.target, ethers.parseEther('50'));
    await token2.connect(user2).approve(vault.target, ethers.parseEther('75'));

    // Users deposit tokens into the vault
    await vault.connect(user).deposit(token.target, ethers.parseEther('25'));
    await vault.connect(user2).deposit(token2.target, ethers.parseEther('50'));

    // Check if the vault balances are correct
    expect(await token.balanceOf(vault.target)).to.equal(ethers.parseEther('25'));
    expect(await token2.balanceOf(vault.target)).to.equal(ethers.parseEther('50'));

    // Users withdraw tokens from the vault
    await vault.connect(user).withdraw(token.target, ethers.parseEther('10'));
    await vault.connect(user2).withdraw(token2.target, ethers.parseEther('25'));

    // Check if the vault balances are updated after withdrawals
    expect(await token.balanceOf(vault.target)).to.equal(ethers.parseEther('15'));
    expect(await token2.balanceOf(vault.target)).to.equal(ethers.parseEther('25'));
  })
});