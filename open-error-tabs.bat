@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title cakette - error / 404 tabs
color 0E

echo ============================================
echo   cakette rubric error tabs
echo ============================================
echo.
echo Opens 404 + health in ONE window.
echo Servers must already be running.
echo.

where msedge >nul 2>&1
if not errorlevel 1 (
  start "" msedge --new-window ^
    "http://localhost:5173/this-page-does-not-exist" ^
    "http://localhost:8000/api/cakes/this-cake-does-not-exist" ^
    "http://localhost:8000/api/health"
  goto done
)
where chrome >nul 2>&1
if not errorlevel 1 (
  start "" chrome --new-window ^
    "http://localhost:5173/this-page-does-not-exist" ^
    "http://localhost:8000/api/cakes/this-cake-does-not-exist" ^
    "http://localhost:8000/api/health"
  goto done
)
start "" "http://localhost:5173/this-page-does-not-exist"

:done
echo.
echo   UI 404:  /this-page-does-not-exist
echo   API 404: /api/cakes/this-cake-does-not-exist
echo   Health:  /api/health
echo.
echo   For 400 validation: blank login email, or empty cake name.
echo ============================================
pause
exit /b 0
