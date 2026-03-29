#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}  ╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}  ║       ViceVearsa Installer           ║${NC}"
echo -e "${GREEN}  ╚══════════════════════════════════════╝${NC}"
echo ""

# ── Check Node.js ────────────────────────────────────────────────────
check_node() {
  if command -v node &> /dev/null; then
    local version
    version=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$version" -ge 20 ]; then
      echo -e "  ${GREEN}✓${NC} Node.js $(node -v) detected"
      return 0
    fi
  fi
  return 1
}

install_node() {
  echo -e "  ${YELLOW}⚠${NC} Node.js 20+ not found. Installing..."

  if command -v nvm &> /dev/null; then
    echo "  Using existing nvm..."
    nvm install 20
    nvm use 20
  elif command -v fnm &> /dev/null; then
    echo "  Using existing fnm..."
    fnm install 20
    fnm use 20
  else
    echo "  Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

    # Load nvm into current session
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    nvm install 20
    nvm use 20
  fi

  if ! check_node; then
    echo -e "  ${RED}✗${NC} Failed to install Node.js 20+. Please install manually:"
    echo "    https://nodejs.org/en/download/"
    exit 1
  fi
}

if ! check_node; then
  install_node
fi

# ── Create workspace ─────────────────────────────────────────────────
WORKSPACE="$HOME/vicevearsa-workspace"

if [ -d "$WORKSPACE/_vicevearsa" ]; then
  echo -e "  ${YELLOW}⚠${NC} ViceVearsa already installed at $WORKSPACE"
  echo "  Re-running setup..."
else
  echo -e "  ${GREEN}→${NC} Creating workspace at $WORKSPACE"
  mkdir -p "$WORKSPACE"
fi

cd "$WORKSPACE"

# ── Run ViceVearsa init ──────────────────────────────────────────────
echo -e "  ${GREEN}→${NC} Installing ViceVearsa..."
npx vicevearsa init --quick

echo ""
echo -e "${GREEN}  ════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ ViceVearsa is ready!${NC}"
echo -e "${GREEN}  ════════════════════════════════════════${NC}"
echo ""
echo "  Dashboard: http://localhost:5173"
echo "  Workspace: $WORKSPACE"
echo ""
