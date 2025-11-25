/**
 * Web3 Service - Ethers.js wrapper for Voting contract interaction
 * Handles contract connection, voting operations, and event listening
 */

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = null;
    this.isConnected = false;
  }

  /**
   * Initialize Web3 connection and contract instance
   * @param {string} rpcUrl - RPC endpoint URL (default: localhost:8545)
   * @param {string} contractAddress - Deployed contract address
   * @param {object} contractABI - Contract ABI JSON
   */
  async init(rpcUrl = "http://127.0.0.1:8545", contractAddress, contractABI) {
    try {
      // Connect to provider
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Get signer (first account on local node)
      const accounts = await this.provider.listAccounts();
      if (accounts.length === 0) {
        throw new Error("No accounts available. Start Hardhat node with 'npm run node'");
      }
      
      this.signer = await this.provider.getSigner(0);
      
      // Initialize contract
      this.contractAddress = contractAddress;
      this.contract = new ethers.Contract(contractAddress, contractABI, this.signer);
      
      this.isConnected = true;
      console.log("✓ Web3 connected:", {
        network: (await this.provider.getNetwork()).name,
        account: await this.signer.getAddress(),
        contract: contractAddress,
      });
      
      return true;
    } catch (err) {
      console.error("✗ Web3 initialization failed:", err.message);
      this.isConnected = false;
      throw err;
    }
  }

  /**
   * Get contract details
   */
  async getContractDetails() {
    if (!this.contract) throw new Error("Contract not initialized");
    
    try {
      const [numCandidates, currentPhase, merkleRoot] = await Promise.all([
        this.contract.numCandidates(),
        this.contract.currentPhase(),
        this.contract.merkleRoot(),
      ]);

      return {
        address: this.contractAddress,
        numCandidates: numCandidates.toString(),
        currentPhase: ["Init", "Commit", "Reveal", "End"][currentPhase],
        merkleRoot: merkleRoot,
      };
    } catch (err) {
      console.error("Error fetching contract details:", err.message);
      throw err;
    }
  }

  /**
   * Get candidate names
   */
  async getCandidates() {
    if (!this.contract) throw new Error("Contract not initialized");
    
    try {
      const numCandidates = await this.contract.numCandidates();
      const candidates = [];
      
      for (let i = 0; i < numCandidates; i++) {
        const name = await this.contract.candidateNames(i);
        candidates.push({ id: i, name });
      }
      
      return candidates;
    } catch (err) {
      console.error("Error fetching candidates:", err.message);
      throw err;
    }
  }

  /**
   * Get current voting results
   */
  async getResults() {
    if (!this.contract) throw new Error("Contract not initialized");
    
    try {
      const candidates = await this.getCandidates();
      const results = [];
      
      for (const candidate of candidates) {
        const votes = await this.contract.votes(candidate.id);
        results.push({
          id: candidate.id,
          name: candidate.name,
          votes: votes.toString(),
        });
      }
      
      return results;
    } catch (err) {
      console.error("Error fetching results:", err.message);
      throw err;
    }
  }

  /**
   * Submit a vote commitment
   * @param {string} candidateId - ID of candidate to vote for
   * @param {string} secret - Random secret (salt) for commit-reveal
   */
  async commitVote(candidateId, secret) {
    if (!this.contract) throw new Error("Contract not initialized");
    
    try {
      // Hash: keccak256(candidateId + secret)
      const commitment = ethers.solidityPackedKeccak256(
        ["uint", "string"],
        [candidateId, secret]
      );
      
      const tx = await this.contract.commitVote(commitment);
      const receipt = await tx.wait();
      
      console.log("✓ Vote committed:", { txHash: receipt.hash, commitment });
      return { txHash: receipt.hash, commitment, secret };
    } catch (err) {
      console.error("Error committing vote:", err.message);
      throw err;
    }
  }

  /**
   * Reveal a committed vote
   * @param {string} candidateId - ID of candidate
   * @param {string} secret - Original secret (salt) used in commit
   */
  async revealVote(candidateId, secret) {
    if (!this.contract) throw new Error("Contract not initialized");
    
    try {
      const tx = await this.contract.revealVote(candidateId, secret);
      const receipt = await tx.wait();
      
      console.log("✓ Vote revealed:", { txHash: receipt.hash, candidateId });
      return receipt.hash;
    } catch (err) {
      console.error("Error revealing vote:", err.message);
      throw err;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address = null) {
    if (!this.provider) throw new Error("Provider not initialized");
    
    try {
      const addr = address || (await this.signer.getAddress());
      const balance = await this.provider.getBalance(addr);
      return ethers.formatEther(balance) + " ETH";
    } catch (err) {
      console.error("Error fetching balance:", err.message);
      throw err;
    }
  }

  /**
   * Get voting statistics
   */
  async getStats() {
    if (!this.contract) throw new Error("Contract not initialized");
    
    try {
      const [whitelisted, submitted] = await Promise.all([
        this.contract.totalVotersWhitelisted(),
        this.contract.totalVotesSubmitted(),
      ]);

      return {
        whitelistedVoters: whitelisted.toString(),
        votesSubmitted: submitted.toString(),
      };
    } catch (err) {
      console.error("Error fetching stats:", err.message);
      throw err;
    }
  }

  /**
   * Listen to contract events (real-time updates)
   */
  listenToEvents() {
    if (!this.contract) throw new Error("Contract not initialized");
    
    this.contract.on("CommitmentMade", (voter, timestamp) => {
      console.log("📢 Event: Vote committed by", voter);
      window.dispatchEvent(new CustomEvent("voteCommitted", { detail: { voter, timestamp } }));
    });

    this.contract.on("VoteRevealed", (voter, candidateId, timestamp) => {
      console.log("📢 Event: Vote revealed for candidate", candidateId);
      window.dispatchEvent(new CustomEvent("voteRevealed", { detail: { voter, candidateId, timestamp } }));
    });

    this.contract.on("PhaseChanged", (newPhase, timestamp) => {
      const phases = ["Init", "Commit", "Reveal", "End"];
      console.log("📢 Event: Phase changed to", phases[newPhase]);
      window.dispatchEvent(new CustomEvent("phaseChanged", { detail: { newPhase: phases[newPhase], timestamp } }));
    });
  }
}

// Export for browser and Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = Web3Service;
}
