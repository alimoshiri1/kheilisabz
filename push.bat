@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Git push helper ===
echo.

REM Check gh auth
gh auth status
if errorlevel 1 (
  echo.
  echo [!] You are not logged in. Run: gh auth login
  pause
  exit /b 1
)

echo.
git add .
set MSG=%*
if "%MSG%"=="" (
  for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set D=%%a-%%b-%%c
  set MSG=update %D% %TIME%
)
git commit -m "%MSG%" 2>nul
if errorlevel 1 echo (nothing new to commit)

echo.
echo Pushing to origin main...
git branch -M main 2>nul
git push -u origin main
if errorlevel 1 (
  echo.
  echo [FAIL] Push failed with 403? Fix auth:
  echo   1- gh auth switch -h github.com   ^(if alimoshiri1 saved^)
  echo   2- or gh auth login ^(login as alimoshiri1^)
  echo   3- or add gascan19982 as collaborator on GitHub website
  pause
  exit /b 1
)

echo.
echo [OK] Pushed successfully.
pause
