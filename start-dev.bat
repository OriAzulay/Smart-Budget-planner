@echo off
REM Double-click this file to start both servers and open the browser.
title Smart Budget Planner - Launcher

echo Starting Smart Budget Planner...
echo.

start "Backend (port 8000)" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

start "Frontend (port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting for servers to come up...
timeout /t 6 /nobreak >nul

start http://localhost:3000

echo.
echo Backend:  http://localhost:8000
echo API docs: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo (You can close this launcher window - the two server windows stay open. Close THEM to stop the servers.)
