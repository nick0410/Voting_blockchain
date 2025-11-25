const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

/**
 * Generate Merkle tree and proof for whitelisted addresses
 * Usage: node scripts/generateMerkle.js <address1> <address2> ...
 */

function generateMerkleTree(addresses) {
  if (!addresses || addresses.length === 0) {
    console.error("Please provide at least one address");
    process.exit(1);
  }

  // Convert addresses to lowercase and create leaves
  const leaves = addresses.map(addr => {
    const cleanAddr = addr.toLowerCase().startsWith('0x') ? addr : '0x' + addr;
    return keccak256(cleanAddr);
  });

  // Create tree
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();

  console.log("\n=== Merkle Tree Generated ===\n");
  console.log("Root:", root);
  console.log("\nWhitelisted Addresses and Proofs:");
  console.log("=====================================\n");

  addresses.forEach((addr, index) => {
    const cleanAddr = addr.toLowerCase().startsWith('0x') ? addr : '0x' + addr;
    const leaf = keccak256(cleanAddr);
    const proof = tree.getHexProof(leaf);
    
    console.log(`Address ${index + 1}: ${cleanAddr}`);
    console.log(`Leaf: ${leaf.toString('hex')}`);
    console.log(`Proof: ${JSON.stringify(proof)}`);
    console.log();
  });

  return {
    root: root,
    tree: tree,
    leaves: leaves,
    proofs: addresses.map((addr, i) => {
      const cleanAddr = addr.toLowerCase().startsWith('0x') ? addr : '0x' + addr;
      const leaf = keccak256(cleanAddr);
      return {
        address: cleanAddr,
        proof: tree.getHexProof(leaf)
      };
    })
  };
}

// If called directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  const result = generateMerkleTree(args);
  
  console.log("\n=== Configuration for Smart Contract ===\n");
  console.log("Merkle Root to set:", result.root);
}

module.exports = { generateMerkleTree };
