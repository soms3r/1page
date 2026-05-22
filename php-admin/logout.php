<?php
require_once __DIR__ . '/functions.php';
initSession();

// Regenerate CSRF token for next login
$_SESSION['_csrf_token'] = bin2hex(random_bytes(32));

// Clear all session data
$_SESSION = [];

// Destroy the session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires'  => time() - 86400,
        'path'     => $params['path'],
        'domain'   => $params['domain'],
        'secure'   => $params['secure'],
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

// Destroy session
session_destroy();

// Redirect to login
header('Location: login.php?signed_out=1');
exit;
