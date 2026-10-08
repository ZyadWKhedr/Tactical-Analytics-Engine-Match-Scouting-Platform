# =============================================================================
# Tactical Analytics Engine - Developer Makefile
# =============================================================================

.PHONY: help install etl api frontend test verify run clean

help:
	@echo "Available commands:"
	@echo "  make install    - Install Python and Node.js dependencies"
	@echo "  make etl        - Ingest raw Wyscout data and fit xG/xA models"
	@echo "  make api        - Launch FastAPI backend (port 8000)"
	@echo "  make frontend   - Launch React dashboard (port 5173)"
	@echo "  make test       - Run FastAPI integration tests (pytest)"
	@echo "  make verify     - Run tactical & mathematical logic audit"
	@echo "  make run        - Launch both API and dashboard (via start.sh)"

install:
	pip install -r requirements.txt
	cd frontend && npm install

etl:
	python -m etl.load_wyscout
	python -m etl.xg_xa

api:
	uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

frontend:
	cd frontend && npm run dev

test:
	python -m pytest tests/test_api.py -v

verify:
	python verify_logic.py

run:
	bash start.sh
