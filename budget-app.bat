@echo off
REM Double-click to start both servers and open the login / register page.
REM Unlike start-dev.bat, this turns off the dev auto-login, so you sign in for real.
title Smart Budget Planner - Budget App

REM The login setting only applies to a fresh server, so make sure none is running.
netstat -ano | findstr /r /c:":3000 .*LISTENING" >nul
if %errorlevel%==0 goto :busy
netstat -ano | findstr /r /c:":8000 .*LISTENING" >nul
if %errorlevel%==0 goto :busy

echo Starting Smart Budget Planner...
echo.

start "Backend (port 8000)" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

start "Frontend (port 3000)" cmd /k "cd /d %~dp0frontend && set NEXT_PUBLIC_SKIP_LOGIN=false&& npm run dev"

echo Waiting for the site to come up (the first load can take ~30 seconds)...
set /a tries=0
:wait
timeout /t 2 /nobreak >nul
set /a tries+=1
curl -s -o nul http://localhost:3000/login
if %errorlevel%==0 goto :open
if %tries% lss 45 goto :wait

:open
start http://localhost:3000/login

echo.
echo Login page: http://localhost:3000/login
echo API docs:   http://localhost:8000/docs
echo.
echo (You can close this window - the two server windows stay open. Close THEM to stop the servers.)
timeout /t 8 >nul
exit /b

:busy
echo.
echo Port 3000 or 8000 is already in use - the app (or start-dev.bat) is probably already running.
echo Close the "Backend" and "Frontend" server windows first, then run this file again.
echo.
pause
