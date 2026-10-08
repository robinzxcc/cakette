@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title cakette - defense autostart
color 0B

echo ============================================
echo   cakette defense autostart
echo ============================================
echo.
echo Starts API + Vite, then opens a FEW public tabs.
echo Login-required pages are NOT auto-opened
echo   (run open-auth-tabs.bat AFTER you sign in).
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install from https://nodejs.org
  pause
  exit /b 1
)

if not exist "server\.env" (
  echo [SETUP] Creating server\.env from server\.env.example ...
  copy /Y "server\.env.example" "server\.env" >nul
  echo       Edit server\.env and set your Atlas MONGO_URI before grading.
)
if not exist "client\.env" (
  echo [SETUP] Creating client\.env ...
  copy /Y "client\.env.example" "client\.env" >nul
)

if not exist "client\node_modules\" (
  echo [SETUP] Installing client dependencies...
  pushd client
  call npm install
  if errorlevel 1 ( popd & echo [ERROR] Client npm install failed. & pause & exit /b 1 )
  popd
)
if not exist "server\node_modules\" (
  echo [SETUP] Installing server dependencies...
  pushd server
  call npm install
  if errorlevel 1 ( popd & echo [ERROR] Server npm install failed. & pause & exit /b 1 )
  popd
)

echo.
echo [1/3] Starting API  -^> http://localhost:8000/api
start "cakette-api" cmd /k "cd /d "%~dp0server" && npm run dev"

echo [2/3] Starting Vite -^> http://localhost:5173
start "cakette-vite" cmd /k "cd /d "%~dp0client" && npm run dev"

echo [3/3] Waiting for servers...
set /a tries=0

:wait_api
set /a tries+=1
powershell -NoProfile -Command "try { $r = Invoke-RestMethod 'http://localhost:8000/api/health' -TimeoutSec 2; if ($r.status -eq 'ok' -or $r.status -eq 'degraded') { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
  if %tries% GEQ 90 (
    echo [ERROR] API did not become ready. Check the cakette-api window.
    pause
    exit /b 1
  )
  timeout /t 1 /nobreak >nul
  goto wait_api
)
echo       API is up.
set /a tries=0

:wait_vite
set /a tries+=1
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://localhost:5173/' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -ge 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
  if %tries% GEQ 90 (
    echo [ERROR] Vite did not become ready. Check the cakette-vite window.
    pause
    exit /b 1
  )
  timeout /t 1 /nobreak >nul
  goto wait_vite
)
echo       Vite is up.

echo.
echo Opening 1 browser window with PUBLIC tabs only...
REM One process + multiple URLs = fewer Edge/Chrome "Sign in" prompts
where msedge >nul 2>&1
if not errorlevel 1 (
  start "" msedge --new-window ^
    "http://localhost:5173/" ^
    "http://localhost:5173/cakes" ^
    "http://localhost:5173/customize" ^
    "http://localhost:5173/login"
  goto after_open
)
where chrome >nul 2>&1
if not errorlevel 1 (
  start "" chrome --new-window ^
    "http://localhost:5173/" ^
    "http://localhost:5173/cakes" ^
    "http://localhost:5173/customize" ^
    "http://localhost:5173/login"
  goto after_open
)
start "" "http://localhost:5173/"

:after_open
echo.
echo ============================================
echo   READY
echo ============================================
echo   App:  http://localhost:5173
echo   API:  http://localhost:8000/api
echo.
echo   Opened: Home, Cakes, Customize, Login
echo.
echo   Next steps:
echo     1. Log in at /login
echo        admin: magtotomb@students.nu-clark.edu.ph / merner123!
echo        user:  mernermagtoto55@gmail.com / merner123!
echo     2. Then run open-auth-tabs.bat  (Studio / orders)
echo     3. For 404/health: open-error-tabs.bat
echo.
powershell -NoProfile -Command "try { $h = Invoke-RestMethod 'http://localhost:8000/api/health'; Write-Host ('  Mongo: ' + $h.database.mode + ' | gradingReady=' + $h.database.gradingReady) } catch { Write-Host '  Could not read /api/health' }"
echo ============================================
pause
exit /b 0
