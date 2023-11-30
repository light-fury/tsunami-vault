// scripts/deploy.ts
import { ethers, network, run } from 'hardhat';

async function main() {
  // Deploying the Vault contract
  const Vault = await ethers.getContractFactory('Vault');
  const vault = await Vault.deploy();

  await vault.waitForDeployment();

  console.log(`Vault contract deployed to: ${vault.target}`);

  // If you want to verify the contract on Etherscan, you can use the following:
  if (network.name === 'mainnet') {
    console.log('Verifying on Etherscan...');
    await run('verify:verify', {
      address: vault.target,
    });
    console.log('Verification completed.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
