<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

/**
 * Toute exception levée sous /api ressort en JSON.
 * Sans ce listener, Symfony renverrait une page HTML d'erreur que le frontend
 * Next.js ne saurait pas interpréter.
 */
#[AsEventListener(event: 'kernel.exception', priority: 0)]
class ApiExceptionListener
{
    public function __construct(private readonly bool $debug = false)
    {
    }

    public function __invoke(ExceptionEvent $event): void
    {
        if (!str_starts_with($event->getRequest()->getPathInfo(), '/api')) {
            return;
        }

        $exception = $event->getThrowable();
        $status = $exception instanceof HttpExceptionInterface
            ? $exception->getStatusCode()
            : Response::HTTP_INTERNAL_SERVER_ERROR;

        $payload = ['error' => $exception->getMessage()];

        if (Response::HTTP_INTERNAL_SERVER_ERROR === $status && !$this->debug) {
            $payload['error'] = 'Une erreur interne est survenue.';
        }

        if ($this->debug) {
            $payload['exception'] = $exception::class;
            $payload['trace'] = array_slice(explode("\n", $exception->getTraceAsString()), 0, 10);
        }

        // Les en-têtes portés par l'exception (Retry-After d'un 429…) font partie
        // de la réponse : le client s'en sert pour savoir quand réessayer.
        $headers = $exception instanceof HttpExceptionInterface ? $exception->getHeaders() : [];

        $event->setResponse(new JsonResponse($payload, $status, $headers));
    }
}
