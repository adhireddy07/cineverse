@echo off
title Push CineVerse to GitHub
echo ========================================================
echo          Push CineVerse to GitHub for 24/7 Hosting
echo ========================================================
echo.
cd /d "C:\Users\kadhi\.gemini\antigravity\scratch\cineverse"

set /p REPO_URL="Enter your GitHub repository URL (e.g. https://github.com/adhireddy07/cineverse.git): "

if "%REPO_URL%"=="" (
    echo No URL entered. Exiting.
    pause
    exit /b
)

git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
echo.
echo Pushing code to GitHub...
git push -u origin main

echo.
echo ========================================================
echo Done! Now connect your GitHub repo to Render.com for 24/7 hosting.
echo ========================================================
pause
