const hre = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const fs = require("fs");
const path = require("path");

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  red: "\x1b[31m",
};

const log = (msg, color = "reset") => console.log(`${COLORS[color]}${msg}${COLORS.reset}`);

async function main() {
  log("\n╔════════════════════════════════════════════════════════╗", "blue");
  log("║        BLOCKCHAIN VOTING SYSTEM - DEPLOYMENT           ║", "blue");
  log("╚════════════════════════════════════════════════════════╝\n", "blue");

  try {
    // Get ethers
    const ethers = hre.ethers;
    const network = await ethers.provider.getNetwork();

    // Get deployer
    const [deployer] = await ethers.getSigners();
    log(`✓ Deployer: ${deployer.address}`, "green");
    log(`✓ Network: ${network.name} (Chain ID: ${network.chainId})`, "green");

    // Get deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    log(`✓ Balance: ${ethers.formatEther(balance)} ETH\n`, "green");

    // Define candidates
    const candidates = ["Alice", "Bob", "Charlie", "Diana"];
    log("📋 Candidates:", "yellow");
    candidates.forEach((c, i) => log(`   ${i + 1}. ${c}`));

    // Create whitelisted addresses (sample)
    const whitelistedAddresses = [
      deployer.address,
      "0x70997970C51812e339D9B73b0245ad59E6f53B97",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    ];

    log("\n👥 Whitelisted Addresses:", "yellow");
    whitelistedAddresses.forEach((addr, i) => {
      log(`   ${i + 1}. ${addr}`);
    });

    // Generate Merkle tree
    log("\n🌳 Generating Merkle Tree...", "yellow");
    const leaves = whitelistedAddresses.map(addr => keccak256(addr.toLowerCase()));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const merkleRoot = tree.getHexRoot();
    log(`✓ Merkle Root: ${merkleRoot}\n`, "green");

    // Deploy contract
    log("🚀 Deploying Voting Contract...", "yellow");
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(candidates, merkleRoot);
    await voting.waitForDeployment();
    const votingAddress = await voting.getAddress();
    log(`✓ Contract deployed at: ${votingAddress}\n`, "green");

    // Verify initial state
    log("✓ Verifying contract state...", "green");
    const totalCandidates = await voting.getTotalCandidates();
    const currentPhase = await voting.getCurrentPhase();
    log(`   Total candidates: ${Number(totalCandidates)}`);
    log(`   Current phase: ${["Init", "Commit", "Reveal", "End"][Number(currentPhase)]}\n`);

    // Generate Merkle proofs for each whitelisted address
    log("🔐 Generating Merkle Proofs for Voters:", "yellow");
    const proofs = {};
    whitelistedAddresses.forEach((addr, i) => {
      const leaf = keccak256(addr.toLowerCase());
      const proof = tree.getHexProof(leaf);
      proofs[addr] = proof;
      log(`\n   Address ${i + 1}: ${addr}`);
      log(`   Proof: [${proof.length} leaves]`);
      proof.forEach((p, idx) => log(`      [${idx}] ${p}`));
    });

    // Create deployment info
    const blockNumber = await ethers.provider.getBlockNumber();
    const deploymentInfo = {
      contractAddress: votingAddress,
      deployerAddress: deployer.address,
      network: network.name,
      chainId: Number(network.chainId),
      blockNumber: Number(blockNumber),
      timestamp: new Date().toISOString(),
      candidates: candidates,
      merkleRoot: merkleRoot,
      whitelistedAddresses: whitelistedAddresses,
      voterProofs: proofs,
    };

    // Save deployment info
    const deploymentDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentDir, `deployment-${network.name}-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    log(`\n✓ Deployment info saved to: ${deploymentFile}`, "green");

    // Save contract address for quick reference
    const addressFile = path.join(deploymentDir, `${network.name}-address.txt`);
    fs.writeFileSync(addressFile, votingAddress);
    log(`✓ Contract address saved to: ${addressFile}\n`, "green");

    // Print summary
    log("╔════════════════════════════════════════════════════════╗", "blue");
    log("║              DEPLOYMENT SUMMARY                         ║", "blue");
    log("╠════════════════════════════════════════════════════════╣", "blue");
    log(`║ Contract: ${votingAddress.slice(0, 42)}            ║`, "blue");
    log(`║ Network: ${network.name.padEnd(47)}║`, "blue");
    log(`║ Deployer: ${deployer.address.slice(0, 42)}            ║`, "blue");
    log(`║ Candidates: ${candidates.length}                                               ║`, "blue");
    log(`║ Whitelisted: ${whitelistedAddresses.length}                                              ║`, "blue");
    log("╚════════════════════════════════════════════════════════╝\n", "blue");

    log("✨ Deployment successful! Contract is ready for use.\n", "green");

    return deploymentInfo;
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
