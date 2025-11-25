# ⚡ QUICK REFERENCE CARD

## 🎯 THE ABSOLUTE BASICS

You have a **voting system on blockchain**. Use it in 3 commands:

```
npm install        ← Install (do once)
npm test           ← Test it (verify works)
npm run deploy     ← Deploy it (go live)
```

Done! 🎉

---

## 📊 What It Does

| Stage | What Happens | Who Does It |
|-------|-------------|-----------|
| **Setup** | Contract deployed with candidates & voters | Owner (you) |
| **Vote** | Voters submit hidden votes | Whitelisted voters |
| **Reveal** | Voters show their actual votes | Whitelisted voters |
| **Results** | Winner announced & locked | System (automatic) |

---

## 🎮 The 3 Voting Phases

```
PHASE 1: COMMIT      PHASE 2: REVEAL       PHASE 3: END
└─ Hide vote         └─ Show vote          └─ Lock results
   (secret)             (verified)            (final)
```

---

## 🔧 All Commands

| Command | Does | Time |
|---------|------|------|
| `npm install` | Setup tools | 2-3 min |
| `npm run compile` | Build contract | < 1 sec |
| `npm test` | Run 15 tests | ~1 sec |
| `npm run deploy` | Deploy contract | ~3 sec |
| `npm run node` | Start blockchain | Always on |
| `npm run deploy:localhost` | Deploy to node | ~3 sec |
| `npm run clean` | Delete artifacts | < 1 sec |
| `npm run build` | Same as compile | < 1 sec |

---

## 📂 Important Files

| File | Edit This If |
|------|-------------|
| `scripts/deploy.js` | Changing candidates or voters |
| `contracts/Voting.sol` | Adding contract features |
| `test/Voting.test.js` | Adding tests |
| `hardhat.config.js` | Changing network settings |

---

## 🔑 Key Concepts

```
MERKLE TREE
└─ Proof that address is whitelisted
   └─ Prevents unauthorized voting

COMMIT-REVEAL
├─ Commit: Hide your vote with hash + salt
└─ Reveal: Prove you voted for what you said

HASH (keccak256)
└─ Mathematical fingerprint
   └─ Hash(candidateId + salt) = commitment

PHASES
├─ Init: Setup
├─ Commit: Vote hidden
├─ Reveal: Vote shown
└─ End: Results locked
```

---

## 📋 Deployment Info (After Running `npm run deploy`)

```
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Network: Hardhat (local test network)
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Candidates: 4 (Alice, Bob, Charlie, Diana)
Voters: 3 (whitelisted addresses)
```

---

## ⚙️ How to Change Things

### Change Candidates
Edit `scripts/deploy.js`:
```javascript
// Find:
const candidates = ["Alice", "Bob", "Charlie", "Diana"];

// Change to:
const candidates = ["John", "Jane", "Jack"];

// Run:
npm run deploy
```

### Add Voters
Edit `scripts/deploy.js`:
```javascript
// Add addresses to:
const whitelistedAddresses = [
  deployer.address,
  "0x70997970C51812e339D9B73b0245ad59E6f53B97",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  // Add new address here
];

// Run:
npm run deploy
```

---

## 🧪 Test Results Explained

### When You Run: `npm test`

```
Voting Contract
  Deployment
    ✔ Should deploy with correct candidates
    ✔ Should set correct Merkle root
    ✔ Should start in Init phase
  Phase Management
    ✔ Only owner can change phase
    ✔ Should change phase correctly
  Commit Vote
    ✔ Should commit vote with valid Merkle proof
    ✔ Should reject commitment without Merkle proof
    ✔ Should prevent double commitment
  Reveal Vote
    ✔ Should reveal vote correctly
    ✔ Should prevent vote with wrong salt
    ✔ Should prevent double reveal
  View Functions
    ✔ Should get candidate by index
    ✔ Should revert for invalid candidate index
    ✔ Should get votes for all candidates
  Winner Determination
    ✔ Should determine winner correctly

15 passing (1s)
```

**What this means:**
- ✅ = Test passed (good!)
- 15 passing = All tests work
- 1s = Took 1 second

---

## 🔐 Security Features (All Tested)

✅ **Merkle Proof**
- Only whitelisted voters can vote
- Test: Invalid proofs rejected ✓

✅ **Commit-Reveal**
- Votes are hidden until revealed
- Test: Prevents vote manipulation ✓

✅ **Double-Voting Prevention**
- Each voter can only vote once
- Test: Second vote rejected ✓

✅ **Phase Control**
- Only owner can change phases
- Test: Non-owner cannot change ✓

✅ **Salt Verification**
- Voters must reveal with correct salt
- Test: Wrong salt rejected ✓

---

## 💡 Real-World Example

**Scenario:** Company voting for new CEO

**Setup:**
```
Candidates: Alice, Bob, Charlie
Voters: 3 executives (whitelisted)
```

**Phase 1 (Commit):**
- Executive 1: Submits hidden vote
- Executive 2: Submits hidden vote
- Executive 3: Submits hidden vote
- Status: No one can see votes yet

**Phase 2 (Reveal):**
- Executive 1: "I voted for Alice"
- Executive 2: "I voted for Bob"
- Executive 3: "I voted for Bob"
- Status: Votes counted (Bob = 2, Alice = 1)

**Phase 3 (End):**
- Winner: Bob
- Status: Final, cannot change

---

## 📞 Quick Help

| Problem | Solution |
|---------|----------|
| `npm install` fails | `npm install --legacy-peer-deps` |
| Tests won't run | `npm run clean && npm install && npm test` |
| Deploy fails | Make sure no other process on port 8545 |
| Can't find contract address | Check `deployments/hardhat-address.txt` |
| Want to see deployment details | Check `deployments/deployment-hardhat-*.json` |

---

## 📚 Documentation Files (Pick One)

| File | Time | Best For |
|------|------|----------|
| **HOW_TO_USE.md** (this) | 10 min | Getting started |
| **START_HERE.md** | 15 min | Complete overview |
| **QUICKSTART.md** | 5 min | Super quick start |
| **COMPLETE_GUIDE.md** | 60 min | Understanding everything |
| **README.md** | 20 min | API reference |

---

## ✨ You're All Set!

Your voting system is:
- ✅ Compiled
- ✅ Tested (15/15 passing)
- ✅ Deployed
- ✅ Ready to use

**To get started:**
```powershell
npm install
npm test
npm run deploy
```

**Questions?** Read the docs above.

**Want to customize?** Edit `scripts/deploy.js` and re-run `npm run deploy`.

**Need production?** Deploy to Sepolia testnet (see COMPLETE_GUIDE.md).

---

## 🎯 One-Minute Summary

You have a blockchain voting contract that:
1. Only lets whitelisted people vote
2. Hides votes until they're revealed
3. Prevents cheating and double-voting
4. Shows permanent, unchangeable results

To use it: `npm install` → `npm test` → `npm run deploy`

That's it! 🚀
