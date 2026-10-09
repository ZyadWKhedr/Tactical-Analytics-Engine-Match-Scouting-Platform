@echo off
echo ============================================================
echo Starting Tactical Analytics Engine API (FastAPI)
echo URL: http://127.0.0.1:8000
echo Docs: http://127.0.0.1:8000/docs
echo ============================================================
if exist .venv\Scripts\activate.bat call .venv\Scripts\activate.bat
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
