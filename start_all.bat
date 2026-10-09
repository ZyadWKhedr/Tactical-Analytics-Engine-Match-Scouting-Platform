@echo off
echo ============================================================
echo Launching Tactical Analytics Engine Full Stack:
echo 1. Backend API (FastAPI) on http://127.0.0.1:8000
echo 2. Frontend Scouting Platform (React) on http://localhost:5173
echo ============================================================
start "Tactical API" cmd /k "start_api.bat"
timeout /t 3 /nobreak >nul
start "Tactical Dashboard" cmd /k "start_dashboard.bat"
echo Services launched in separate windows.
pause
