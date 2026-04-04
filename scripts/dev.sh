#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Starting MongoDB..."
docker compose -f docker/docker-compose.yml up -d mongo

echo "In separate terminals:"
echo "  npm run dev -w backend"
echo "  npm run dev -w frontend"
echo "Optional: npm run node -w contracts"
