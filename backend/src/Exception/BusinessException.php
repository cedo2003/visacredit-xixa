<?php

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Erreur métier destinée à l'utilisateur (stock insuffisant, solde insuffisant,
 * échéances incohérentes…). Remplace les `throw new Exception` suivis d'une
 * redirection avec ?error= du code PHP natif : renvoyée en 422 + JSON.
 */
class BusinessException extends HttpException
{
    public function __construct(string $message, int $statusCode = 422)
    {
        parent::__construct($statusCode, $message);
    }
}
