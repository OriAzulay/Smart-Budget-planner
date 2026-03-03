# Start Development Servers
# Run this script from the project root: .\start-dev.ps1

Write-Host "Starting Budget App Development Servers..." -ForegroundColor Cyan

# Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; uvicorn app.main:app --reload --port 8000"

# Wait a moment for backend to initialize
Start-Sleep -Seconds 2

# Start Frontend in new window  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "Servers starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login: admin@admin.com / admin123" -ForegroundColor Magenta
