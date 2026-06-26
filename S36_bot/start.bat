@echo off
SET PYTHONPATH=%~dp0
SET PATH=%~dp0venv\Scripts;%PATH%

START "Rasa Action Server" cmd /c "rasa run actions --actions actions"
timeout /t 8 /nobreak >nul
START "Rasa API Server" cmd /c "rasa run --enable-api --cors * --model models"
echo.
echo S36_bot starting...
echo Action server on http://localhost:5055
echo API server on http://localhost:5005
echo.
pause
