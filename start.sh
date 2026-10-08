#!/usr/bin/env bash
# =============================================================================
# Tactical Analytics Engine - Unix Launcher (Linux / macOS)
# Starts FastAPI REST Backend (port 8000) and React Dashboard (port 5173).
# =============================================================================

set -e

# Trap Ctrl+C (SIGINT) and SIGTERM to kill background jobs cleanly
cleanup() {
    echo ""
    echo "Shutting down Tactical Analytics Engine..."
    kill $(jobs -p) 2>/dev/null || true
    wait 2>/dev/null || true
    echo "All processes stopped."
}
trap cleanup SIGINT SIGTERM EXIT

echo "========================================================================"
echo " Starting Tactical Analytics Engine (Backend & Frontend)"
echo "========================================================================"

# Activate virtual environment if present
if [ -d ".venv" ]; then
    echo "[1/3] Activating virtual environment (.venv)..."
    source .venv/bin/activate
fi

# 1. Start FastAPI REST API
echo "[2/3] Launching FastAPI backend on http://127.0.0.1:8000..."
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
API_PID=$!

# Wait 2 seconds for API port to bind
sleep 2

# 2. Start React + Vite Frontend
echo "[3/3] Launching React Dashboard on http://localhost:5173..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "========================================================================"
echo " System Online:"
echo "   - React Dashboard: http://localhost:5173"
echo "   - REST API Docs:   http://127.0.0.1:8000/docs"
echo " Press Ctrl+C to terminate all services."
echo "========================================================================"

wait
