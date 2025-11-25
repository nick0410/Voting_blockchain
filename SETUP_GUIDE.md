# 🚀 Blockchain Voting System - Complete Setup Guide

## What You Have

A **production-ready blockchain voting system** with:
- ✅ Smart contract with commit-reveal voting + Merkle whitelisting
- ✅ Professional web3 frontend with real-time updates
- ✅ Hardhat local development environment
- ✅ Comprehensive test suite (15 tests)
- ✅ Deployment automation with Merkle tree generation
- ✅ Event listening and live event log

---

## 🔧 Installation & Setup

### Step 1: Install Dependencies

```bash
# Navigate to project root
cd C:\Users\KIIT0001\random\blockchain-voting

# Install all dependencies (fixes peer dependency conflicts)
npm install --legacy-peer-deps

# Or force install if legacy-peer-deps doesn't work
npm install --force
```

### Step 2: Verify Installation

```bash
# Check Hardhat is available
npx hardhat --version

# Check node and npm versions
node -v
npm -v
```

---

## 🎯 Running the System

### Option A: Full Development Setup (Recommended)

**Terminal 1 - Start Hardhat Local Node:**
```bash
npm run node
```

Expected output:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts (20 funded with 10000 ETH each):
Account #0: 0x... (...)
...
```

**Terminal 2 - Deploy Contract:**
```bash
npm run deploy:localhost
```

Expected output:
```
✓ Deployer: 0x...
✓ Network: hardhat (Chain ID: 31337)
✓ Balance: 10000.0 ETH

📋 Candidates:
   1. Alice
   2. Bob
   3. Charlie
   4. Diana

✓ Contract deployed at: 0x...
✓ Merkle root: 0x...
✓ Deployment saved to: deployments/deployment-hardhat-*.json
```

**Terminal 3 - Start Frontend Server:**
```bash
npm run serve
```

Expected output:
```
✓ Server running at http://localhost:3000
✓ Open http://localhost:3000 in your browser
```

**Open in Browser:**
- Navigate to: http://localhost:3000

---

### Option B: Quick Test Run

```bash
# Compile contracts
npm run compile

# Run all tests (15/15 should pass)
npm test

# Deploy to localhost (requires 'npm run node' in another terminal)
npm run deploy:localhost
```

---

## 🌐 Using the Web3 Frontend

### 1. **Connect Web3**
   - Click "Connect Web3" button
   - System connects to http://127.0.0.1:8545 (local Hardhat node)
   - Shows your account address and ETH balance

### 2. **View Candidates**
   - Click "Load Candidates"
   - See all available candidates from the contract

### 3. **Cast Your Vote (Two-Step Process)**

   **Step 1: Commit Vote**
   - Select a candidate from dropdown
   - Enter a secret passphrase (you'll need this to reveal later)
   - Click "Step 1: Commit Vote"
   - Secret is stored locally in browser

   **Step 2: Reveal Vote**
   - After commit phase ends (in real voting, this is later)
   - Click "Step 2: Reveal Vote"
   - This submits your actual vote on-chain

### 4. **Monitor Live Results**
   - Click "Refresh Results"
   - See vote counts update in real-time
   - Watch the event log for commit/reveal events

---

## 📝 Available Commands

| Command | Purpose |
|---------|---------|
| `npm run compile` | Compile Solidity contracts |
| `npm run test` | Run all tests (15 tests) |
| `npm run deploy` | Deploy to default network |
| `npm run deploy:localhost` | Deploy to localhost (requires node running) |
| `npm run node` | Start local Hardhat node at http://127.0.0.1:8545 |
| `npm run serve` | Start frontend server at http://localhost:3000 |
| `npm run dev` | Start both node and server together (if concurrently installed) |
| `npm run generate-merkle` | Generate Merkle tree for whitelisted voters |
| `npm run clean` | Clean build artifacts |

---

## 🏗️ Project Structure

```
blockchain-voting/
├── contracts/
│   └── voting.sol              # Smart contract (356 lines)
├── scripts/
│   ├── deploy.js               # Deployment script with Merkle tree gen
│   ├── deploy.ts               # TypeScript version
│   └── generateMerkle.js       # Merkle tree utility
├── test/
│   └── Voting.test.js          # 15 unit tests
├── index.html                  # Web3 frontend UI
├── web3-service.js             # Web3 service wrapper (ethers.js)
├── server.js                   # Simple HTTP server
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Dependencies & scripts
├── deployments/                # Deployment artifacts
│   ├── deployment-hardhat-*.json
│   └── hardhat-address.txt
└── artifacts/                  # Compiled contract ABIs
```

---

## 🔍 Key Features Explained

### Voting Smart Contract (`contracts/voting.sol`)

**Phase System:**
- `Init` - Initial setup phase
- `Commit` - Voters submit vote commitments (hashed)
- `Reveal` - Voters reveal actual votes
- `End` - Voting closed

**Security Features:**
- ✅ Commit-reveal mechanism (prevents frontrunning)
- ✅ Merkle tree whitelisting (gas-efficient)
- ✅ Double-voting prevention
- ✅ Owner-controlled phase transitions
- ✅ Comprehensive event logging

**Main Functions:**
```solidity
// Voter operations
commitVote(bytes32 commitment)           // Submit vote commitment
revealVote(uint candidateId, string secret) // Reveal vote

// Admin operations (owner only)
setPhase(Phase newPhase)                 // Change voting phase
setMerkleRoot(bytes32 root)              // Set whitelisted voters
setPhaseDuration(Phase phase, uint duration) // Configure timing
resetVoter(address voter)                // Emergency voter reset
```

---

## 🧪 Running Tests

```bash
# Run all 15 tests
npm test

# Watch mode (auto-rerun on changes)
npx hardhat test --watch

# Run specific test
npx hardhat test test/Voting.test.js
```

**Test Coverage (15 tests):**
- ✅ Contract deployment
- ✅ Phase transitions
- ✅ Candidate management
- ✅ Vote commitment
- ✅ Vote reveal
- ✅ Results calculation
- ✅ Merkle root validation
- ✅ Double-voting prevention
- ✅ Event emissions
- ✅ Statistics tracking
- ✅ And more...

---

## 🐛 Troubleshooting

### Problem: "hardhat: not found"
**Solution:** Run `npm install --legacy-peer-deps` again

### Problem: "Cannot connect to http://127.0.0.1:8545"
**Solution:** 
1. Make sure `npm run node` is running in a separate terminal
2. Wait 2-3 seconds after starting the node
3. Check the node terminal shows "Started HTTP... server"

### Problem: "Contract address not found"
**Solution:**
1. Deploy contract: `npm run deploy:localhost`
2. Check `deployments/hardhat-address.txt` for address
3. Update contract address in `index.html` if needed

### Problem: "ERESOLVE unable to resolve dependency tree"
**Solution:** Use `--legacy-peer-deps` or `--force`:
```bash
npm install --legacy-peer-deps
# or
npm install --force
```

### Problem: "Port 3000 already in use"
**Solution:** Change port in `server.js` line 7:
```javascript
const PORT = 3001;  // Use different port
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│      Browser (index.html)                │
│  - Web3 UI                               │
│  - Vote form                             │
│  - Results display                       │
│  - Event log                             │
└────────────┬────────────────────────────┘
             │ JSON-RPC calls (ethers.js)
             ↓
┌─────────────────────────────────────────┐
│    web3-service.js (ethers.js wrapper)  │
│  - Contract interaction                  │
│  - Signer management                     │
│  - Event listening                       │
└────────────┬────────────────────────────┘
             │ JSON-RPC
             ↓
┌─────────────────────────────────────────┐
│   Hardhat Local Node (Ethereum RPC)     │
│  - Port: 8545                            │
│  - 20 pre-funded accounts                │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│   Smart Contract (Voting.sol)            │
│  - Solidity 0.8.20                       │
│  - 356 lines                             │
│  - EVM execution                         │
└─────────────────────────────────────────┘
```

---

## 🚀 Deployment to Real Network (Optional)

To deploy to a real network (Ethereum, Sepolia, Polygon, etc.):

1. **Update `hardhat.config.js`:**
   ```javascript
   networks: {
     sepolia: {
       url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
       accounts: ["YOUR_PRIVATE_KEY"]
     }
   }
   ```

2. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Update frontend:** Update `RPC_URL` and `CONTRACT_ADDRESS` in `index.html`

---

## 📞 Support & Resources

- **Hardhat Docs:** https://hardhat.org/docs
- **ethers.js Docs:** https://docs.ethers.org/v6/
- **Solidity Docs:** https://docs.soliditylang.org/
- **OpenZeppelin Contracts:** https://docs.openzeppelin.com/contracts/

---

## ✅ Next Steps

1. ✅ Run: `npm install --legacy-peer-deps`
2. ✅ Run: `npm run node` (terminal 1)
3. ✅ Run: `npm run deploy:localhost` (terminal 2)
4. ✅ Run: `npm run serve` (terminal 3)
5. ✅ Open: http://localhost:3000 in browser
6. ✅ Click: "Connect Web3"
7. ✅ Vote: Try the commit-reveal voting process

---

**Happy Voting! 🗳️**
