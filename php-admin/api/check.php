<?php
/**
 * Session Check API
 *
 * Returns authentication status and CSRF token for JS clients.
 * Called by the static admin pages to verify PHP session.
 *
 * GET /admin/api/check.php
 *
 * Response:
 *   { authenticated: true, csrf_token: "..." }
 *   { authenticated: false }
 */

require_once __DIR__ . '/../functions.php';
initSession();

if (isAuthenticated()) {
    jsonSuccess([
        'authenticated' => true,
        'csrf_token'    => generateCsrfToken(),
    ]);
} else {
    jsonResponse([
        'authenticated' => false,
    ]);
}
