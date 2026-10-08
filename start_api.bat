@echo off
echo ============================================================
echo Starting Tactical Analytics Engine API (FastAPI)
echo URL: http://localhost:8000
echo Docs: http://localhost:8000/docs
echo ============================================================
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause
