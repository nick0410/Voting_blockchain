# Blockchain Voting System

A secure, decentralized voting system built on Ethereum using a commit-reveal voting mechanism with Merkle tree-based whitelisting. This system prevents double voting and ensures voter privacy.

## Features

- **Secure Voting**: Commit-reveal mechanism prevents vote manipulation
- **Whitelisting**: Merkle tree-based voter whitelisting
- **Double Voting Prevention**: Tracks voters to prevent multiple votes
- **Smart Contract Audited**: Full test coverage with Mocha and Chai
- **Privacy**: Voter identity protected during commit phase
- **Owner Controls**: Phase management by contract owner

## Architecture

### Voting Phases

1. **Init**: Initial state, contract setup
2. **Commit**: Voters commit their vote hash without revealing choice
3. **Reveal**: Voters reveal their actual vote and it's counted
4. **End**: Voting closed, results final

### Key Components

- **Smart Contract** (`contracts/Voting.sol`): Core voting logic
- **Merkle Tree**: Whitelists eligible voters
- **Commit-Reveal**: Two-phase voting for privacy
- **Test Suite** (`test/Voting.test.ts`): Comprehensive tests
- **Deployment Script** (`scripts/deploy.ts`): Automated deployment

## Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Start local node
npm run node
```

## Usage

### 1. Generate Merkle Tree for Whitelisted Voters

```bash
node scripts/generateMerkle.js 0xAddress1 0xAddress2 0xAddress3
```

This generates a Merkle root and proofs for whitelisted addresses.

### 2. Deploy Contract

```bash
npm run deploy
```

This:
- Creates a Merkle tree for sample addresses
- Deploys the Voting contract
- Sets up voting parameters
- Outputs deployment info and proofs

### 3. Participate in Voting

#### Phase 1: Commit
```javascript
// Voter creates a commitment
const commitment = keccak256(abi.encodePacked(candidateId, salt));
// Voter submits commitment with Merkle proof
await voting.commitVote(commitment, merkleProof);
```

#### Phase 2: Reveal
```javascript
// Owner moves to reveal phase
await voting.setPhase(Phase.Reveal);

// Voter reveals their vote
await voting.revealVote(candidateId, salt);
```

#### Phase 3: Results
```javascript
// Owner concludes voting
await voting.setPhase(Phase.End);

// Get results
const winner = await voting.getWinner();
const allVotes = await voting.getAllVotes();
```

## Smart Contract API

### Owner Functions

- `setPhase(Phase)`: Change voting phase
- `setMerkleRoot(bytes32)`: Update whitelist

### Voter Functions

- `commitVote(bytes32 commitment, bytes32[] proof)`: Commit a vote
- `revealVote(uint candidateId, string salt)`: Reveal and cast vote

### View Functions

- `getCandidate(uint id)`: Get candidate name
- `getVotes(uint id)`: Get vote count for candidate
- `getAllCandidates()`: Get all candidates
- `getAllVotes()`: Get all vote counts
- `getWinner()`: Get winning candidate
- `getTotalCandidates()`: Get number of candidates
- `getCurrentPhase()`: Get current voting phase
- `isWhitelisted(address, bytes32[])`: Check if address is whitelisted
- `hasVoterVoted(address)`: Check if voter has voted

## Testing

Run the complete test suite:

```bash
npm run test
```

Tests cover:
- ✅ Contract deployment
- ✅ Phase management
- ✅ Vote commitment
- ✅ Vote revelation
- ✅ Merkle proof verification
- ✅ Double voting prevention
- ✅ Winner determination
- ✅ Edge cases and error handling

## Security Considerations

1. **Merkle Proof Verification**: Only whitelisted voters can participate
2. **Commit-Reveal**: Prevents vote manipulation through two-phase voting
3. **Double Voting Prevention**: Each address can only vote once
4. **Owner Controls**: Voting phases managed by trusted owner
5. **OpenZeppelin Contracts**: Uses audited MerkleProof library

## Deployment

### Local Testing

```bash
npm run node          # Terminal 1: Start local blockchain
npm run deploy        # Terminal 2: Deploy contract
```

### Production Deployment

Update `hardhat.config.ts` with network settings and deploy:

```bash
npm run deploy -- --network <network-name>
```

## Gas Optimization

The contract uses:
- Efficient mapping structures
- Optimized Merkle proof verification
- Batch result queries to reduce calls
- OpenZeppelin's gas-optimized libraries

## File Structure

```
blockchain-voting/
├── contracts/
│   └── Voting.sol              # Main voting contract
├── scripts/
│   ├── deploy.ts               # Deployment script
│   └── generateMerkle.js       # Merkle tree generator
├── test/
│   └── Voting.test.ts          # Test suite
├── hardhat.config.ts           # Hardhat configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## Example Workflow

```typescript
// 1. Deploy contract
const voting = await Voting.deploy(
  ["Alice", "Bob", "Charlie"],
  merkleRoot
);

// 2. Set to commit phase
await voting.setPhase(Phase.Commit);

// 3. Voters commit
const commitment = keccak256(abi.encodePacked(1, "secret_salt"));
await voting.connect(voter1).commitVote(commitment, merkleProof);

// 4. Set to reveal phase
await voting.setPhase(Phase.Reveal);

// 5. Voters reveal and vote
await voting.connect(voter1).revealVote(1, "secret_salt");

// 6. Conclude voting
await voting.setPhase(Phase.End);

// 7. Get results
const [winnerId, voteCount] = await voting.getWinner();
console.log(`Candidate ${winnerId} won with ${voteCount} votes`);
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting PR.

```bash
npm run test
npm run compile
```

## Support

For issues or questions, please open a GitHub issue or contact the development team.
