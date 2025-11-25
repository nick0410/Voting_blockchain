const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256Lib = require("keccak256");
const { solidityPacked, keccak256 } = require("ethers");

describe("Voting Contract", function () {
  let voting;
  let candidates;
  let merkleRoot;
  let tree;
  let owner;
  let voter1;
  let voter2;
  let voter3;
  let nonWhitelisted;

  beforeEach(async function () {
    // Get signers
    [owner, voter1, voter2, voter3, nonWhitelisted] = await ethers.getSigners();

    // Define candidates
    candidates = ["Alice", "Bob", "Charlie", "Diana"];

    // Create whitelisted addresses
    const whitelistedAddresses = [owner.address, voter1.address, voter2.address];

    // Generate Merkle tree
    const leaves = whitelistedAddresses.map(addr =>
      keccak256Lib(addr.toLowerCase())
    );
    tree = new MerkleTree(leaves, keccak256Lib, { sortPairs: true });
    merkleRoot = tree.getHexRoot();

    // Deploy contract
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(candidates, merkleRoot);
  });

  describe("Deployment", function () {
    it("Should deploy with correct candidates", async function () {
      const totalCandidates = await voting.getTotalCandidates();
      expect(Number(totalCandidates)).to.equal(candidates.length);

      const allCandidates = await voting.getAllCandidates();
      expect(allCandidates).to.deep.equal(candidates);
    });

    it("Should set correct Merkle root", async function () {
      expect(await voting.merkleRoot()).to.equal(merkleRoot);
    });

    it("Should start in Init phase", async function () {
      const phase = await voting.getCurrentPhase();
      expect(phase).to.equal(0); // Phase.Init
    });
  });

  describe("Phase Management", function () {
    it("Only owner can change phase", async function () {
      try {
        await voting.connect(voter1).setPhase(1);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Ownable");
      }
    });

    it("Should change phase correctly", async function () {
      await voting.setPhase(1); // Commit phase
      expect(await voting.getCurrentPhase()).to.equal(1);

      await voting.setPhase(2); // Reveal phase
      expect(await voting.getCurrentPhase()).to.equal(2);

      await voting.setPhase(3); // End phase
      expect(await voting.getCurrentPhase()).to.equal(3);
    });
  });

  describe("Commit Vote", function () {
    beforeEach(async function () {
      await voting.setPhase(1); // Move to Commit phase
    });

    it("Should commit vote with valid Merkle proof", async function () {
      const candidateId = 0;
      const salt = "test_salt_123";
      const commitment = ethers.keccak256(
        solidityPacked(["uint256", "string"], [candidateId, salt])
      );

      const leaf = keccak256(voter1.address.toLowerCase());
      const proof = tree.getHexProof(leaf);

      const tx = await voting.connect(voter1).commitVote(commitment, proof);
      expect(tx).not.to.be.null;

      expect(await voting.commitments(voter1.address)).to.equal(commitment);
    });

    it("Should reject commitment without Merkle proof", async function () {
      const candidateId = 0;
      const salt = "test_salt_123";
      const commitment = ethers.keccak256(
        solidityPacked(["uint256", "string"], [candidateId, salt])
      );

      const invalidProof = [ethers.keccak256(ethers.toUtf8Bytes("invalid"))];

      try {
        await voting.connect(nonWhitelisted).commitVote(commitment, invalidProof);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Not whitelisted");
      }
    });

    it("Should prevent double commitment", async function () {
      const candidateId = 0;
      const salt = "test_salt_123";
      const commitment = ethers.keccak256(
        solidityPacked(["uint256", "string"], [candidateId, salt])
      );

      const leaf = keccak256(voter1.address.toLowerCase());
      const proof = tree.getHexProof(leaf);

      await voting.connect(voter1).commitVote(commitment, proof);

      // Try to commit again
      try {
        await voting.connect(voter1).commitVote(commitment, proof);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Already committed");
      }
    });
  });

  describe("Reveal Vote", function () {
    const candidateId = 1;
    const salt = "test_salt_456";

    beforeEach(async function () {
      // Move to Commit phase and commit votes
      await voting.setPhase(1);

      const commitment = ethers.keccak256(
        solidityPacked(["uint256", "string"], [candidateId, salt])
      );

      const leaves = [
        owner.address,
        voter1.address,
        voter2.address,
      ].map(addr => keccak256Lib(addr.toLowerCase()));
      tree = new MerkleTree(leaves, keccak256Lib, { sortPairs: true });

      const proofs = [owner, voter1, voter2].map(signer => {
        const leaf = keccak256Lib(signer.address.toLowerCase());
        return tree.getHexProof(leaf);
      });

      await voting.connect(owner).commitVote(commitment, proofs[0]);
      await voting.connect(voter1).commitVote(commitment, proofs[1]);
      await voting.connect(voter2).commitVote(commitment, proofs[2]);

      // Move to Reveal phase
      await voting.setPhase(2);
    });

    it("Should reveal vote correctly", async function () {
      const tx = await voting.connect(voter1).revealVote(candidateId, salt);
      expect(tx).not.to.be.null;

      const votes = await voting.getVotes(candidateId);
      expect(Number(votes)).to.equal(1);
    });

    it("Should prevent vote with wrong salt", async function () {
      try {
        await voting.connect(voter1).revealVote(candidateId, "wrong_salt");
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Commitment mismatch");
      }
    });

    it("Should prevent double reveal", async function () {
      await voting.connect(voter1).revealVote(candidateId, salt);

      try {
        await voting.connect(voter1).revealVote(candidateId, salt);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Already revealed");
      }
    });
  });

  describe("View Functions", function () {
    it("Should get candidate by index", async function () {
      const candidate = await voting.getCandidate(0);
      expect(candidate).to.equal("Alice");
    });

    it("Should revert for invalid candidate index", async function () {
      try {
        await voting.getCandidate(999);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Invalid candidate index");
      }
    });

    it("Should get votes for all candidates", async function () {
      const allVotes = await voting.getAllVotes();
      expect(allVotes.length).to.equal(candidates.length);
    });
  });

  describe("Winner Determination", function () {
    it("Should determine winner correctly", async function () {
      // Move to Commit phase
      await voting.setPhase(1);

      // Commit votes
      const commitment0 = ethers.keccak256(
        solidityPacked(["uint256", "string"], [0, "salt1"])
      );
      const commitment1 = ethers.keccak256(
        solidityPacked(["uint256", "string"], [0, "salt2"])
      );
      const commitment2 = ethers.keccak256(
        solidityPacked(["uint256", "string"], [1, "salt3"])
      );

      const leaves = [
        owner.address,
        voter1.address,
        voter2.address,
      ].map(addr => keccak256Lib(addr.toLowerCase()));
      tree = new MerkleTree(leaves, keccak256Lib, { sortPairs: true });

      const proofs = [owner, voter1, voter2].map(signer => {
        const leaf = keccak256Lib(signer.address.toLowerCase());
        return tree.getHexProof(leaf);
      });

      await voting.connect(owner).commitVote(commitment0, proofs[0]);
      await voting.connect(voter1).commitVote(commitment1, proofs[1]);
      await voting.connect(voter2).commitVote(commitment2, proofs[2]);

      // Move to Reveal phase
      await voting.setPhase(2);

      await voting.connect(owner).revealVote(0, "salt1");
      await voting.connect(voter1).revealVote(0, "salt2");
      await voting.connect(voter2).revealVote(1, "salt3");

      // Move to End phase
      await voting.setPhase(3);

      const winner = await voting.getWinner();
      expect(Number(winner[0])).to.equal(0); // Alice wins
      expect(Number(winner[1])).to.equal(2); // With 2 votes
    });
  });
});
