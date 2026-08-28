@echo off
REM ============================================================
REM  Visacredit XIXA - lance l'API Symfony et l'application mobile
REM
REM  Difference avec demarrer.bat : l'API ecoute sur 0.0.0.0 et
REM  non sur 127.0.0.1, sinon un telephone du reseau local ne
REM  peut pas l'atteindre.
REM ============================================================

cd /d "%~dp0"

echo.
echo   Visacredit XIXA mobile - demarrage
echo   ---------------------------------
echo.

REM --- MySQL doit tourner (panneau XAMPP ou service Windows) ---
"C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo   [!] MySQL ne repond pas.
    echo       Demarrez-le depuis le panneau de controle XAMPP, puis relancez ce script.
    echo.
    pause
    exit /b 1
)
echo   [ok] MySQL en marche

REM --- Dependances installees ? ---
if not exist "backend\vendor" (
    echo   [!] Dependances PHP manquantes. Lancement de composer install...
    pushd backend && composer install --no-interaction && popd
)
if not exist "mobile\node_modules" (
    echo   [!] Dependances Node manquantes. Lancement de npm install...
    pushd mobile && npm install && popd
)

REM --- Adresse IP locale, a communiquer si la detection auto echoue ---
echo.
echo   Adresse(s) IP de cette machine :
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo      %%a

REM --- API Symfony, accessible depuis le reseau local ---
start "Visacredit XIXA - API Symfony (0.0.0.0:8000)" cmd /k "cd /d %~dp0backend && php -S 0.0.0.0:8000 -t public"
echo.
echo   [ok] API Symfony      -^> port 8000, accessible depuis le reseau local

REM --- Metro / Expo ---
start "Visacredit XIXA - Application mobile (Expo)" cmd /k "cd /d %~dp0mobile && npm start"
echo   [ok] Expo             -^> scannez le QR code avec Expo Go

echo.
echo   Si le pare-feu Windows demande une autorisation pour PHP ou Node,
echo   acceptez-la pour les reseaux prives : sans cela le telephone ne
echo   pourra joindre ni l'API ni Metro.
echo.
echo   Fermez les deux fenetres pour arreter les serveurs.
echo.
pause
