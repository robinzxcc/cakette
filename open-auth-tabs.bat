@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title cakette - auth / studio tabs
color 0A

echo ============================================
echo   cakette auth / studio tabs
echo ============================================
echo.
echo Log in FIRST in the browser, then press any key.
echo.
echo   Admin: magtotomb@students.nu-clark.edu.ph / merner123!
echo   User:  mernermagtoto55@gmail.com / merner123!
echo.
pause

echo Opening auth-required tabs in ONE window...
where msedge >nul 2>&1
if not errorlevel 1 (
  start "" msedge --new-window ^
    "http://localhost:5173/dashboard" ^
    "http://localhost:5173/manage/cakes" ^
    "http://localhost:5173/manage/promotions" ^
    "http://localhost:5173/orders" ^
    "http://localhost:5173/profile"
  goto done
)
where chrome >nul 2>&1
if not errorlevel 1 (
  start "" chrome --new-window ^
    "http://localhost:5173/dashboard" ^
    "http://localhost:5173/manage/cakes" ^
    "http://localhost:5173/manage/promotions" ^
    "http://localhost:5173/orders" ^
    "http://localhost:5173/profile"
  goto done
)
start "" "http://localhost:5173/dashboard"

:done
echo.
echo Done. If a tab bounced to Login, you were not signed in yet.
pause
exit /b 0
