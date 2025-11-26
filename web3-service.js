/**
 * Web3 Service - Ethers.js wrapper for Voting contract interaction
 * Handles contract connection, voting operations, and event listening
 * Supports both MetaMask and local Hardhat node
 */

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = null;
    this.isConnected = false;
    this.walletAddress = null;
    this.networkId = null;
  }

  /**
   * Check if MetaMask is available
   */
  static isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect to MetaMask wallet
   */
  async connectMetaMask() {
    try {
      if (!Web3Service.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask extension.');
      }

      console.log('Requesting accounts from MetaMask...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in MetaMask');
      }

      this.walletAddress = accounts[0].toLowerCase();
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const network = await this.provider.getNetwork();
      this.networkId = network.chainId;

      console.log('✓ MetaMask connected:', {
        address: this.walletAddress,
        chainId: this.networkId,
        network: network.name,
      });

      return this.walletAddress;
    } catch (err) {
      console.error('✗ MetaMask connection failed:', err.message);
      throw new Error(`MetaMask connection failed: ${err.message}`);
    }
  }

  /**
   * Listen for MetaMask account changes
   */
  onAccountChange(callback) {
    if (Web3Service.isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          this.walletAddress = accounts[0];
          callback(accounts[0]);
        }
      });
    }
  }

  /**
   * Listen for MetaMask network changes
   */
  onNetworkChange(callback) {
    if (Web3Service.isMetaMaskInstalled()) {
      window.ethereum.on('chainChanged', (chainId) => {
        this.networkId = parseInt(chainId, 16);
        callback(this.networkId);
      });
    }
  }

  /**
   * Initialize Web3 connection and contract instance
   * @param {string} rpcUrl - RPC endpoint URL (default: localhost:8545)
   * @param {string} contractAddress - Deployed contract address
   * @param {object} contractABI - Contract ABI JSON
   * @param {boolean} useMetaMask - Use MetaMask if available
   */
  async init(rpcUrl = "http://127.0.0.1:8545", contractAddress, contractABI, useMetaMask = true) {
    try {
      // Try to use MetaMask first if available and requested
      if (useMetaMask && Web3Service.isMetaMaskInstalled()) {
        await this.connectMetaMask();
      } else {
        // Fallback to JSON-RPC provider
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        const accounts = await this.provider.listAccounts();
        if (accounts.length === 0) {
          throw new Error("No accounts available. Start Hardhat node with 'npm run node'");
        }
        this.signer = await this.provider.getSigner(0);
        this.walletAddress = await this.signer.getAddress();
      }
      
      // Initialize contract
      this.contractAddress = contractAddress;
      this.contract = new ethers.Contract(contractAddress, contractABI, this.signer);
      
      this.isConnected = true;
      console.log("✓ Web3 connected:", {
        network: (await this.provider.getNetwork()).name,
        account: this.walletAddress,
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
        this.contract.getTotalCandidates(),
        this.contract.getCurrentPhase(),
        this.contract.getMerkleRoot ? this.contract.getMerkleRoot() : this.contract.merkleRoot,
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
      let candidates;
      if (this.contract.getAllCandidates) {
        candidates = await this.contract.getAllCandidates();
      } else if (this.contract.candidateNames) {
        const totalCandidates = await this.contract.getTotalCandidates();
        candidates = [];
        for (let i = 0; i < totalCandidates; i++) {
          candidates.push(await this.contract.candidateNames(i));
        }
      } else {
        throw new Error("Cannot fetch candidates - no suitable method available");
      }
      return candidates.map((name, id) => ({ id, name }));
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
      const candidates = await this.contract.getAllCandidates();
      const votesCounts = await this.contract.getAllVotes();
      
      return candidates.map((name, id) => ({
        id,
        name,
        votes: votesCounts[id].toString(),
      }));
    } catch (err) {
      console.error("Error fetching results:", err.message);
      throw err;
    }
  }

  /**
   * Submit a vote commitment with Merkle proof
   * @param {string} candidateId - ID of candidate to vote for
   * @param {string} secret - Random secret (salt) for commit-reveal
   * @param {array} merkleProof - Merkle proof for the voter address
   */
  async commitVote(candidateId, secret, merkleProof = []) {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      // Hash: keccak256(candidateId + secret)
      const commitment = ethers.solidityPackedKeccak256(
        ["uint", "string"],
        [candidateId, secret]
      );

      // Use provided proof or empty array if not available
      const proof = merkleProof || [];

      const tx = await this.contract.commitVote(commitment, proof);
      const receipt = await tx.wait();

      console.log("✓ Vote committed:", { txHash: receipt.hash, commitment });
      return { txHash: receipt.hash, commitment, secret };
    } catch (err) {
      console.error("Error committing vote:", err.message);
      throw err;
    }
  }

  /**
   * Get Merkle proof for an address
   * @param {string} address - Wallet address
   * @returns {array} Merkle proof
   */
  getMerkleProofForAddress(address) {
    // This will be populated from deployment info
    return [];
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
      const addr = address || this.walletAddress;
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
      const stats = await this.contract.getVotingStats();
      
      return {
        whitelistedVoters: stats[0].toString(),
        votesSubmitted: stats[1].toString(),
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
      window.dispatchEvent(new CustomEvent("voteRevealed", { detail: { voter, candidateId: candidateId.toString(), timestamp } }));
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
