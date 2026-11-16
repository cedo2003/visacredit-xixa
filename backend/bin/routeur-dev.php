<?php

/**
 * Routeur du serveur de développement (`php -S … bin/routeur-dev.php`).
 *
 * Sans lui, le serveur intégré de PHP prend toute URL qui se termine par une
 * extension pour un fichier statique : `/api/ventes/11/facture.pdf` répondait
 * 404 sans jamais atteindre Symfony. Ce script sert les vrais fichiers de
 * `public/` et confie tout le reste au contrôleur frontal.
 *
 * Développement seulement : en production, FrankenPHP (Caddyfile) fait ce
 * travail.
 */
$public = dirname(__DIR__).'/public';
$fichier = $public.parse_url($_SERVER['REQUEST_URI'], \PHP_URL_PATH);

if ('/' !== $_SERVER['REQUEST_URI'] && is_file($fichier)) {
    return false;
}

$_SERVER['SCRIPT_FILENAME'] = $public.'/index.php';
$_SERVER['SCRIPT_NAME'] = '/index.php';

require $public.'/index.php';
