@echo off
SET PYTHONPATH=%~dp0
SET PATH=%~dp0venv\Scripts;%PATH%
rasa train --data data --out models
pause
