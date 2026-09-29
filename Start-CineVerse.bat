@echo off
title CineVerse Platform Launcher
echo ========================================================
echo         CineVerse Streaming Platform Launcher
echo ========================================================
echo.
cd /d "C:\Users\kadhi\.gemini\antigravity\scratch\cineverse"
echo Starting Spring Boot and Cloudflare Tunnel...
python run_cineverse.py
pause
