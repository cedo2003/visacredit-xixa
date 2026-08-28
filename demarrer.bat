@echo off
REM ============================================================
REM  Visacredit XIXA - lance l'API Symfony et le frontend Next.js
REM  Chaque service s'ouvre dans sa propre fenetre : fermez-la
REM  pour arreter le service correspondant.
REM ============================================================

cd /d "%~dp0"

echo.
echo   Visacredit XIXA - demarrage
echo   ---------------------------
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
if not exist "frontend\node_modules" (
    echo   [!] Dependances Node manquantes. Lancement de npm install...
    pushd frontend && npm install && popd
)

REM --- API Symfony sur le port 8000 ---
start "Visacredit XIXA - API Symfony (port 8000)" cmd /k "cd /d %~dp0backend && php -S 127.0.0.1:8000 -t public"
echo   [ok] API Symfony      -^> http://127.0.0.1:8000

REM --- Frontend Next.js sur le port 3000 ---
start "Visacredit XIXA - Frontend Next.js (port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"
echo   [ok] Frontend Next.js -^> http://localhost:3000

REM --- Laisse a Next.js le temps de compiler avant d'ouvrir le navigateur.
REM     ping plutot que timeout : timeout echoue si l'entree est redirigee.
echo.
echo   Ouverture du navigateur dans 15 secondes (compilation Next.js)...
ping -n 16 127.0.0.1 >nul
start "" http://localhost:3000

echo.
echo   Termine. Fermez les deux fenetres pour arreter les serveurs.
echo.
pause
