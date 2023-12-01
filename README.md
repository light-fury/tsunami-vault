# Vault Smart Contract

This smart contract, named Vault, is designed to manage deposits and withdrawals of ERC-20 tokens with whitelisting and administrative controls. It supports token whitelisting to restrict transactions to specific tokens and includes administrative controls such as pausing/unpausing the contract, whitelisting tokens, removing tokens from the whitelist, and managing administrators.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Deploying the Contract](#deploying-the-contract)
  - [Interacting with the Contract](#interacting-with-the-contract)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- Deposit and withdraw ERC-20 tokens.
- Token whitelisting to restrict transactions.
- Administrative controls: pausing/unpausing, whitelisting, removing from whitelist, managing administrators.

## Getting Started

### Prerequisites

- Node.js and npm installed
- Hardhat installed (`npm install --global hardhat`)
- Ethereum wallet (e.g., MetaMask) for testing on a local blockchain or mainnet

### Installation

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

### Usage

#### Deploying the Contract

1. Configure your deployment environment in the `hardhat.config.js` file.

2. Create a `.env` file in the root directory and add your Ethereum wallet private key and Ethereum Mainnet API key:

    ```bash
        PRIVATE_KEY=<your-private-key>
        ETHERSCAN_API_KEY=<your-etherscan-api-key>
        ALCHEMY_KEY=<your-alchemy-key>
    ```

3. Deploy the contract to the local Hardhat Network for testing:

    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```
    Or 
    ```bash
    npm run deploy:development
    ```

4. Deploy the contract to the local Hardhat Network for testing:

    ```bash
    npx hardhat run scripts/deploy.js --network goerli
    ```
    Or 
    ```bash
    npm run deploy:goerli
    ```

5. Deploy the contract to the Ethereum Mainnet:

    ```bash
    npx hardhat run scripts/deploy.js --network mainnet
    ```
    Or 
    ```bash
    npm run deploy:mainnet
    ```

#### Interacting with the Contract

After deploying the contract, you can interact with it using the provided functions. Make sure to use an Ethereum wallet like MetaMask and connect it to the deployed contract address.

For example, using the Hardhat Console
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

Interact with the contract:

```bash
const Vault = await ethers.getContractFactory("Vault");
const vault = await Vault.attach("<deployed-contract-address>");

// Example: Deposit tokens
const tokenAddress = "<token-address>";
const amount = ethers.utils.parseEther("10");
await vault.deposit(tokenAddress, amount);

// Example: Withdraw tokens
await vault.withdraw(tokenAddress, amount);

// Example: Pause and Unpause the contract
await vault.pause();
await vault.unpause();

// Example: Whitelist and remove a token from the whitelist
await vault.whitelistToken(tokenAddress);
await vault.removeTokenFromWhitelist(tokenAddress);

// Example: Add and remove an admin
const newAdmin = "<new-admin-address>";
await vault.addAdmin(newAdmin);
await vault.removeAdmin(newAdmin);

```

### Testing

Run the unit tests using Hardhat:

```bash
npx hardhat test
```
Or
```bash
npm run test
```

To check the coverage

```bash
npx hardhat coverage
```
Or

```bash
npm run coverage
```

### Contributing

### License
