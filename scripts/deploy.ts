import hre from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

async function main() {
  console.log("Deploying Voting Contract...\n");

  // Get ethers from hardhat runtime (available after @nomicfoundation/hardhat-ethers plugin loads)
  const ethers = (hre as any).ethers;
  
  // Get signer from Hardhat
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", await deployer.getAddress());
  // Define candidates
  const candidates = ["Alice", "Bob", "Charlie", "Diana"];
  console.log("Candidates:", candidates);

  // Create sample whitelisted addresses
  const whitelistedAddresses = [
    deployer.address,
    "0x70997970C51812e339D9B73b0245ad59E6f53B97",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  ];

  console.log("\nWhitelisted addresses:");
  whitelistedAddresses.forEach((addr, i) => {
    console.log(`  ${i + 1}. ${addr}`);
  });

  // Generate Merkle tree
  const leaves = whitelistedAddresses.map(addr =>
    keccak256(addr.toLowerCase())
  );
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const merkleRoot = tree.getHexRoot();

  console.log("\nMerkle Root:", merkleRoot);

  // Deploy contract
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(candidates, merkleRoot);
  await voting.waitForDeployment();

  console.log("\nVoting contract deployed at:", await voting.getAddress());

  // Store deployment info
  const deploymentInfo = {
    contractAddress: await voting.getAddress(),
    merkleRoot: merkleRoot,
    candidates: candidates,
    whitelistedAddresses: whitelistedAddresses,
    deployer: await deployer.getAddress(),
    network: (await ethers.provider.getNetwork()).name,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Get proofs for whitelisted addresses
  console.log("\n=== Merkle Proofs for Voters ===\n");
  whitelistedAddresses.forEach((addr, i) => {
    const leaf = keccak256(addr.toLowerCase());
    const proof = tree.getHexProof(leaf);
    console.log(`Address ${i + 1}: ${addr}`);
    console.log(`Proof: ${JSON.stringify(proof)}\n`);
  });

  // Verify deployment
  const totalCandidates = await voting.getTotalCandidates();
  const allCandidates = await voting.getAllCandidates();
  const phase = await voting.getCurrentPhase();

  console.log("=== Contract Verification ===");
  console.log("Total candidates:", Number(totalCandidates));
  console.log("Candidates:", allCandidates);
  console.log("Current phase:", ["Init", "Commit", "Reveal", "End"][Number(phase)]);

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
