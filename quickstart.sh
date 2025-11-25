#!/bin/bash
# Quick start script for the Voting System
# Usage: bash quickstart.sh

set -e

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   Blockchain Voting System - Quick Start               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${BLUE}[1/4]${NC} Installing dependencies..."
npm install --legacy-peer-deps 2>/dev/null || npm install --force 2>/dev/null
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Compile contracts
echo -e "${BLUE}[2/4]${NC} Compiling smart contracts..."
npm run compile > /dev/null 2>&1
echo -e "${GREEN}✓ Contracts compiled${NC}"
echo ""

# Step 3: Run tests
echo -e "${BLUE}[3/4]${NC} Running tests..."
npm test -- --reporter min 2>/dev/null
echo -e "${GREEN}✓ All tests passed${NC}"
echo ""

# Step 4: Ready for dev
echo -e "${BLUE}[4/4]${NC} Ready to start development!"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "  Terminal 1: npm run node"
echo "  Terminal 2: npm run deploy:localhost"
echo "  Terminal 3: npm run serve"
echo ""
echo "  Then open: http://localhost:3000"
echo ""
echo -e "${GREEN}Setup complete! ✓${NC}"
echo ""
