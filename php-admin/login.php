<?php
require_once __DIR__ . '/functions.php';
initSession();

// Already authenticated? Redirect to dashboard
if (isAuthenticated()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
$expired = isset($_GET['expired']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password   = $_POST['password'] ?? '';
    $csrf       = $_POST['_csrf_token'] ?? '';
    $redirect   = $_POST['_redirect'] ?? 'dashboard.php';

    if (!validateCsrfToken($csrf)) {
        $error = 'Invalid form token. Please try again.';
    } elseif (empty($password)) {
        $error = 'Password is required.';
    } elseif (verifyPassword($password)) {
        $_SESSION['authenticated'] = true;
        $_SESSION['_created'] = time();

        // Regenerate session ID to prevent fixation
        session_regenerate_id(true);

        // Sanitize redirect path
        $allowedPrefixes = ['dashboard.php', '/'];
        $safe = false;
        foreach ($allowedPrefixes as $prefix) {
            if (str_starts_with($redirect, $prefix)) { $safe = true; break; }
        }
        if (!$safe) $redirect = 'dashboard.php';

        header('Location: ' . $redirect);
        exit;
    } else {
        $error = 'Invalid password.';
        // Artificial delay to slow brute force
        usleep(500000);
    }
}

$csrfToken = generateCsrfToken();
$redirect = $_GET['redirect'] ?? 'dashboard.php';
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login</title>
<link rel="stylesheet" href="assets/style.css">
</head>
<body class="login-body">
<div class="login-container">
    <div class="login-header">
        <span class="dollar">$</span>
        <span class="title">admin</span>
    </div>
    <p class="login-subtitle">Settings &amp; CMS Control</p>

    <?php if ($expired): ?>
        <div class="flash flash-warning">Session expired. Please sign in again.</div>
    <?php endif; ?>

    <?php if ($error): ?>
        <div class="flash flash-error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="post" class="login-form">
        <?= csrfField() ?>
        <input type="hidden" name="_redirect" value="<?= htmlspecialchars($redirect) ?>">

        <label for="password">Password</label>
        <input type="password" id="password" name="password"
               placeholder="password" autofocus required>

        <button type="submit">sign in</button>
    </form>

    <a href="/" class="back-link">&lt; back to site</a>
</div>
</body>
</html>
