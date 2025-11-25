// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title Voting
 * @dev Advanced secure voting system with commit-reveal mechanism and Merkle proof-based whitelisting
 * Features:
 * - Private voting via commit-reveal mechanism
 * - Gas-efficient Merkle tree whitelisting
 * - Double-voting prevention
 * - Comprehensive event logging
 * - Phase-based voting workflow
 * - Admin controls for voting management
 */
contract Voting is Ownable {
    // ============ Enums ============
    enum Phase { Init, Commit, Reveal, End }

    // ============ State Variables ============
    Phase public currentPhase;
    bytes32 public merkleRoot;
    
    uint public numCandidates;
    string[] public candidateNames;
    
    // Voting data
    mapping(uint => uint) public votes; // candidateId => vote count
    mapping(address => bytes32) public commitments; // voter => commitment hash
    mapping(address => bool) public revealed; // voter => has revealed
    mapping(address => bool) public hasVoted; // voter => has voted
    
    // Voting statistics
    uint public totalVotersWhitelisted;
    uint public totalVotesSubmitted;
    
    // Phase timing
    uint public phaseStartTime;
    mapping(Phase => uint) public phaseDuration;

    // ============ Events ============
    event PhaseChanged(Phase indexed newPhase, uint timestamp);
    event CommitmentMade(address indexed voter, uint timestamp);
    event VoteRevealed(address indexed voter, uint indexed candidateId, uint timestamp);
    event MerkleRootUpdated(bytes32 indexed newRoot, uint timestamp);
    event CandidateAdded(string indexed candidateName, uint indexed candidateId);
    event VotingStarted(Phase phase, uint timestamp);
    event VotingEnded(uint timestamp);
    event StatsUpdated(uint totalVoters, uint totalVotes);

    // ============ Constructor ============
    constructor(string[] memory _candidates, bytes32 _merkleRoot) Ownable(msg.sender) {
        require(_candidates.length > 0, "At least one candidate required");
        require(_candidates.length <= 256, "Too many candidates");
        
        candidateNames = _candidates;
        numCandidates = _candidates.length;
        merkleRoot = _merkleRoot;
        currentPhase = Phase.Init;
        phaseStartTime = block.timestamp;
        
        // Set default phase durations (in seconds)
        phaseDuration[Phase.Init] = 1 hours;
        phaseDuration[Phase.Commit] = 24 hours;
        phaseDuration[Phase.Reveal] = 24 hours;
        phaseDuration[Phase.End] = 0; // No duration for end phase
        
        for (uint i = 0; i < _candidates.length; i++) {
            emit CandidateAdded(_candidates[i], i);
        }
    }

    // ============ Owner Functions ============
    
    /**
     * @dev Update the Merkle root for whitelisted voters
     * @param _root New Merkle root
     * @param _totalWhitelisted Total number of whitelisted voters
     */
    function setMerkleRoot(bytes32 _root, uint _totalWhitelisted) external onlyOwner {
        require(_totalWhitelisted > 0, "Must have whitelisted voters");
        merkleRoot = _root;
        totalVotersWhitelisted = _totalWhitelisted;
        emit MerkleRootUpdated(_root, block.timestamp);
    }

    /**
     * @dev Update voting phase with automatic timestamp tracking
     * @param _phase New phase
     */
    function setPhase(Phase _phase) external onlyOwner {
        require(uint(_phase) <= uint(Phase.End), "Invalid phase");
        currentPhase = _phase;
        phaseStartTime = block.timestamp;
        emit PhaseChanged(_phase, block.timestamp);
        emit VotingStarted(_phase, block.timestamp);
    }

    /**
     * @dev Set custom phase duration
     * @param _phase Phase to set duration for
     * @param _duration Duration in seconds
     */
    function setPhaseDuration(Phase _phase, uint _duration) external onlyOwner {
        require(_duration > 0 || _phase == Phase.End, "Duration must be positive");
        phaseDuration[_phase] = _duration;
    }

    /**
     * @dev Emergency function to reset voter's voting state (admin only)
     * @param _voter Address to reset
     */
    function resetVoter(address _voter) external onlyOwner {
        require(currentPhase == Phase.Init, "Can only reset during Init phase");
        commitments[_voter] = bytes32(0);
        revealed[_voter] = false;
        hasVoted[_voter] = false;
    }

    // ============ Voter Functions ============
    
    /**
     * @dev Commit a vote with Merkle proof
     * Proves the voter is whitelisted and prevents double voting
     * @param commitment keccak256(abi.encodePacked(candidateId, salt))
     * @param proof Merkle proof for the voter address
     */
    function commitVote(bytes32 commitment, bytes32[] calldata proof) external {
        require(currentPhase == Phase.Commit, "Not in commit phase");
        require(!hasVoted[msg.sender], "Already voted");
        require(commitments[msg.sender] == bytes32(0), "Already committed");
        require(commitment != bytes32(0), "Invalid commitment");
        
        // Verify Merkle proof - address must be whitelisted
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Not whitelisted"
        );
        
        commitments[msg.sender] = commitment;
        totalVotesSubmitted++;
        emit CommitmentMade(msg.sender, block.timestamp);
        emit StatsUpdated(totalVotersWhitelisted, totalVotesSubmitted);
    }

    /**
     * @dev Reveal and cast vote
     * Matches the commitment and increments vote count
     * @param candidateId ID of candidate to vote for
     * @param salt Salt used in commitment
     */
    function revealVote(uint candidateId, string calldata salt) external {
        require(currentPhase == Phase.Reveal, "Not in reveal phase");
        require(!revealed[msg.sender], "Already revealed");
        require(commitments[msg.sender] != bytes32(0), "No commitment made");
        require(candidateId < numCandidates, "Invalid candidate");
        require(bytes(salt).length > 0, "Invalid salt");
        
        bytes32 commitment = commitments[msg.sender];
        bytes32 recomputed = keccak256(abi.encodePacked(candidateId, salt));
        require(recomputed == commitment, "Commitment mismatch");
        
        votes[candidateId]++;
        revealed[msg.sender] = true;
        hasVoted[msg.sender] = true;
        emit VoteRevealed(msg.sender, candidateId, block.timestamp);
    }

    // ============ View Functions ============
    
    /**
     * @dev Get candidate name by index
     * @param _index Candidate index
     * @return Candidate name
     */
    function getCandidate(uint _index) external view returns (string memory) {
        require(_index < numCandidates, "Invalid candidate index");
        return candidateNames[_index];
    }

    /**
     * @dev Get vote count for a candidate
     * @param _index Candidate index
     * @return Vote count
     */
    function getVotes(uint _index) external view returns (uint) {
        require(_index < numCandidates, "Invalid candidate index");
        return votes[_index];
    }

    /**
     * @dev Get total number of candidates
     * @return Number of candidates
     */
    function getTotalCandidates() external view returns (uint) {
        return numCandidates;
    }

    /**
     * @dev Get current voting phase
     * @return Current phase
     */
    function getCurrentPhase() external view returns (Phase) {
        return currentPhase;
    }

    /**
     * @dev Get time elapsed since phase start
     * @return Seconds elapsed
     */
    function getPhaseElapsedTime() external view returns (uint) {
        return block.timestamp - phaseStartTime;
    }

    /**
     * @dev Get remaining time for current phase
     * @return Seconds remaining (0 if phase expired)
     */
    function getPhaseRemainingTime() external view returns (uint) {
        uint duration = phaseDuration[currentPhase];
        if (duration == 0) return 0;
        
        uint elapsed = block.timestamp - phaseStartTime;
        if (elapsed >= duration) return 0;
        return duration - elapsed;
    }

    /**
     * @dev Get all candidates
     * @return Array of candidate names
     */
    function getAllCandidates() external view returns (string[] memory) {
        return candidateNames;
    }

    /**
     * @dev Get all vote counts
     * @return Array of vote counts for each candidate
     */
    function getAllVotes() external view returns (uint[] memory) {
        uint[] memory results = new uint[](numCandidates);
        for (uint i = 0; i < numCandidates; i++) {
            results[i] = votes[i];
        }
        return results;
    }

    /**
     * @dev Get winning candidate with vote count
     * @return candidateId Index of candidate with most votes
     * @return voteCount Number of votes for winner
     */
    function getWinner() external view returns (uint candidateId, uint voteCount) {
        require(currentPhase == Phase.End, "Voting not finished");
        
        uint maxVotes = 0;
        uint winnerIndex = 0;
        
        for (uint i = 0; i < numCandidates; i++) {
            if (votes[i] > maxVotes) {
                maxVotes = votes[i];
                winnerIndex = i;
            }
        }
        
        return (winnerIndex, maxVotes);
    }

    /**
     * @dev Get detailed voting results
     * @return candidates Array of candidate names
     * @return voteCounts Array of vote counts
     * @return winner Name of winning candidate
     * @return winnerVotes Number of votes for winner
     */
    function getResults() external view returns (
        string[] memory candidates,
        uint[] memory voteCounts,
        string memory winner,
        uint winnerVotes
    ) {
        require(currentPhase == Phase.End, "Voting not finished");
        
        uint maxVotes = 0;
        uint winnerIndex = 0;
        uint[] memory allVotes = new uint[](numCandidates);
        
        for (uint i = 0; i < numCandidates; i++) {
            allVotes[i] = votes[i];
            if (votes[i] > maxVotes) {
                maxVotes = votes[i];
                winnerIndex = i;
            }
        }
        
        return (candidateNames, allVotes, candidateNames[winnerIndex], maxVotes);
    }

    /**
     * @dev Check if address is whitelisted
     * @param _address Address to check
     * @param _proof Merkle proof
     * @return true if address is in merkle tree
     */
    function isWhitelisted(address _address, bytes32[] calldata _proof) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_address));
        return MerkleProof.verify(_proof, merkleRoot, leaf);
    }

    /**
     * @dev Check if voter has already voted
     * @param _voter Address of voter
     * @return true if voter has voted
     */
    function hasVoterVoted(address _voter) external view returns (bool) {
        return hasVoted[_voter];
    }

    /**
     * @dev Get voter's commitment
     * @param _voter Address of voter
     * @return Commitment hash (0x0 if no commitment)
     */
    function getVoterCommitment(address _voter) external view returns (bytes32) {
        return commitments[_voter];
    }

    /**
     * @dev Check if voter has revealed
     * @param _voter Address of voter
     * @return true if voter has revealed
     */
    function hasVoterRevealed(address _voter) external view returns (bool) {
        return revealed[_voter];
    }

    /**
     * @dev Get voting statistics
     * @return whitelisted Total whitelisted voters
     * @return submitted Total vote submissions
     * @return participationRate Percentage participation (scaled by 100)
     */
    function getVotingStats() external view returns (
        uint whitelisted,
        uint submitted,
        uint participationRate
    ) {
        if (totalVotersWhitelisted == 0) return (0, totalVotesSubmitted, 0);
        participationRate = (totalVotesSubmitted * 10000) / totalVotersWhitelisted;
        return (totalVotersWhitelisted, totalVotesSubmitted, participationRate);
    }
}
