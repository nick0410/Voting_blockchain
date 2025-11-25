# 🚀 QUICK REFERENCE - Blockchain Voting System

## ⚡ 30-Second Setup

```bash
npm install --legacy-peer-deps
```

## 🎯 Start System (3 Terminals)

| Terminal | Command | Purpose |
|----------|---------|---------|
| 1 | `npm run node` | Start blockchain at 8545 |
| 2 | `npm run deploy:localhost` | Deploy contract |
| 3 | `npm run serve` | Start frontend at 3000 |

**Then open:** http://localhost:3000

---

## 📋 Essential Commands

```bash
npm run compile         # Compile Solidity
npm test               # Run 15 tests
npm run node           # Start local blockchain
npm run serve          # Start frontend
npm run deploy:localhost  # Deploy contract
npm run clean          # Clean build files
```

---

## 🗳️ How to Vote

1. **Click** "Connect Web3"
2. **Select** candidate from dropdown
3. **Enter** secret passphrase
4. **Click** "Step 1: Commit Vote"
5. **(Later)** Click "Step 2: Reveal Vote"
6. **Watch** results update in real-time

---

## 🔍 File Purposes

| File | Purpose |
|------|---------|
| `contracts/voting.sol` | Smart contract |
| `test/Voting.test.js` | 15 unit tests |
| `scripts/deploy.js` | Deployment script |
| `index.html` | Web3 frontend UI |
| `web3-service.js` | ethers.js wrapper |
| `server.js` | HTTP server |
| `hardhat.config.js` | Hardhat config |

---

## 🐛 Quick Fixes

| Problem | Fix |
|---------|-----|
| `npm ERR! peer dep` | `npm install --legacy-peer-deps` |
| `hardhat: not found` | Run `npm install --legacy-peer-deps` again |
| Can't connect to 8545 | Make sure `npm run node` is running |
| Port 3000 in use | Change PORT in `server.js` |

---

## ✨ Key Features

- ✅ Commit-Reveal voting (prevents frontrunning)
- ✅ Merkle whitelisting (gas-efficient)
- ✅ Double-vote prevention
- ✅ Real-time results
- ✅ Event monitoring
- ✅ Beautiful responsive UI

---

## 🔗 Addresses

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Blockchain | http://127.0.0.1:8545 | 8545 |

---

## 📊 Contract Info

- **Language:** Solidity 0.8.20
- **Lines:** 356
- **Tests:** 15/15 passing ✅
- **Candidates:** Alice, Bob, Charlie, Diana
- **Phases:** Init, Commit, Reveal, End

---

## 🎓 Test Status

```
✅ 15 passing tests
✅ Full contract coverage
✅ Event verification
✅ Edge case handling
```

---

## 🌐 Tech Stack

- **Frontend:** HTML5 + CSS3 + JavaScript
- **Web3:** ethers.js v6
- **Contract:** Solidity 0.8.20
- **Dev:** Hardhat 2.17.0
- **Testing:** Mocha + Chai 4.5.0

---

## 🎯 Current Status

| Component | Status |
|-----------|--------|
| Smart Contract | ✅ Ready |
| Frontend | ✅ Ready |
| Tests | ✅ Ready |
| Deployment | ✅ Ready |
| Web3 Integration | ✅ Ready |
| Documentation | ✅ Ready |

---

## 📖 Detailed Guides

- `SETUP_GUIDE.md` - Step-by-step setup
- `README_NEW.md` - Full documentation  
- `FINAL_SUMMARY.md` - Implementation details

---

## 🚦 Traffic Light Check

🟢 **Ready to Use:**
- Compile: `npm run compile`
- Tests: `npm test`
- Deploy: `npm run deploy:localhost`
- Frontend: `npm run serve`

🟢 **All Systems Go!**

---

## 💡 Pro Tips

1. **Save your secret!** Store the passphrase safely to reveal later
2. **Watch the logs** - Event log shows all blockchain activity
3. **Check balance** - Each account has 10,000 ETH on local node
4. **Phase matters** - Can only commit in Commit phase, reveal in Reveal phase
5. **Mobile friendly** - Try voting on your phone!

---

## 🎉 Ready to Vote?

```bash
# Copy & paste this in your terminal:
npm install --legacy-peer-deps && npm run node
# Then in another terminal:
npm run deploy:localhost
# Then in another terminal:
npm run serve
# Then open: http://localhost:3000
```

**Done!** You have a working blockchain voting system! 🗳️

---

**For help:** Check SETUP_GUIDE.md or README_NEW.md
