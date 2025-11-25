// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Voting is Ownable {
    enum Phase { Init, Commit, Reveal, End }
    Phase public phase;

    bytes32 public merkleRoot; // whitelist root
    uint public numCandidates;
    string[] public candidateNames;
    mapping(uint => uint) public votes; // candidateId => count

    // commitments
    mapping(address => bytes32) public commitments;
    mapping(address => bool) public revealed;
    mapping(address => bool) public hasVoted;

    event PhaseChanged(Phase newPhase);
    event CommitmentMade(address indexed voter);
    event VoteRevealed(address indexed voter, uint candidateId);
    event MerkleRootUpdated(bytes32 merkleRoot);
    event CandidateAdded(string name);

    constructor(string[] memory _candidates, bytes32 _merkleRoot) Ownable(msg.sender) {
        candidateNames = _candidates;
        numCandidates = _candidates.length;
        merkleRoot = _merkleRoot;
        phase = Phase.Init;
    }

    // OWNER functions
    function setMerkleRoot(bytes32 _root) external onlyOwner {
        merkleRoot = _root;
        emit MerkleRootUpdated(_root);
    }

    function setPhase(Phase _phase) external onlyOwner {
        phase = _phase;
        emit PhaseChanged(_phase);
    }

    // Voter commits hash(commit = keccak256(abi.encodePacked(candidateId, salt)))
    // plus supplies a Merkle proof to prove eligibility (address in whitelist)
    function commitVote(bytes32 commitment, bytes32[] calldata proof) external {
        require(phase == Phase.Commit, "Not in commit phase");
        require(commitments[msg.sender] == bytes32(0), "Already committed");
        require(!hasVoted[msg.sender], "Already voted");
        // verify merkle proof for msg.sender
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Not whitelisted");
        commitments[msg.sender] = commitment;
        emit CommitmentMade(msg.sender);
    }

    // reveal: provide candidateId and salt used for commitment
    function revealVote(uint candidateId, string calldata salt) external {
        require(phase == Phase.Reveal, "Not in reveal phase");
        require(!revealed[msg.sender], "Already revealed");
        bytes32 comm = commitments[msg.sender];
        require(comm != bytes32(0), "No commitment");
        bytes32 recomputed = keccak256(abi.encodePacked(candidateId, salt));
        require(recomputed == comm, "Commitment mismatch");
        require(candidateId < numCandidates, "Invalid candidate");
        votes[candidateId] += 1;
        revealed[msg.sender] = true;
        hasVoted[msg.sender] = true;
        emit VoteRevealed(msg.sender, candidateId);
    }

    // Read helpers
    function getCandidate(uint i) external view returns (string memory) {
        require(i < numCandidates, "Out of range");
        return candidateNames[i];
    }

    function getVotes(uint i) external view returns (uint) {
        require(i < numCandidates, "Out of range");
        return votes[i];
    }

    // Finalize results: simple getter, owner can set End phase
    function getTotalCandidates() external view returns (uint) {
        return numCandidates;
    }

    function getAllCandidates() external view returns (string[] memory) {
        return candidateNames;
    }

    function getAllVotes() external view returns (uint[] memory) {
        uint[] memory allVotes = new uint[](numCandidates);
        for (uint i = 0; i < numCandidates; i++) {
            allVotes[i] = votes[i];
        }
        return allVotes;
    }

    function getCurrentPhase() external view returns (Phase) {
        return phase;
    }

    function getWinner() external view returns (uint, uint) {
        require(phase == Phase.End, "Voting not finished");
        uint maxVotes = 0;
        uint winnerId = 0;
        for (uint i = 0; i < numCandidates; i++) {
            if (votes[i] > maxVotes) {
                maxVotes = votes[i];
                winnerId = i;
            }
        }
        return (winnerId, maxVotes);
    }
}
