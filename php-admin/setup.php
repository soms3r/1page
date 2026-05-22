<?php
/**
 * One-time setup tool
 *
 * Run this in your browser after deploying to generate
 * the bcrypt password hash for config.php.
 *
 * Security: Delete this file after use.
 */

$hash = '';
$password = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    $confirm  = $_POST['confirm'] ?? '';

    if (strlen($password) < 8) {
        $error = 'Password must be at least 8 characters.';
    } elseif ($password !== $confirm) {
        $error = 'Passwords do not match.';
    } else {
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }
}
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Setup</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    background: #0a0a0a; color: #e0e0e0; font-family: 'Courier New', monospace;
    display: flex; align-items: center; justify-content: center; min-height: 100vh;
}
.container {
    border: 1px solid #1e3a1e; border-radius: 8px; padding: 32px;
    background: #111; max-width: 640px; width: 100%; margin: 20px;
}
h1 { color: #00ff41; font-size: 18px; margin-bottom: 8px; }
p { color: #888; font-size: 13px; margin-bottom: 20px; line-height: 1.5; }
label { display: block; font-size: 12px; color: #888; margin-bottom: 4px; }
input[type="password"] {
    width: 100%; padding: 10px 12px; margin-bottom: 12px;
    background: #0a0a0a; border: 1px solid #1e3a1e; border-radius: 4px;
    color: #e0e0e0; font-family: inherit; font-size: 14px;
}
input[type="password"]:focus { border-color: #00ff41; outline: none; }
button {
    background: transparent; border: 1px solid #00ff41; color: #00ff41;
    padding: 10px 24px; border-radius: 4px; cursor: pointer;
    font-family: inherit; font-size: 13px; margin-top: 4px;
}
button:hover { background: #00ff41; color: #000; }
.error { color: #ff4444; font-size: 12px; margin-bottom: 12px; }
.hash-box {
    background: #0a0a0a; border: 1px solid #1e3a1e; border-radius: 4px;
    padding: 16px; margin-top: 16px;
}
.hash-box code {
    color: #00ff41; font-size: 12px; word-break: break-all;
    display: block; margin-bottom: 8px;
}
.hash-box .note { color: #888; font-size: 11px; }
.danger { color: #ff6b35; font-size: 11px; margin-top: 16px; padding: 8px; border: 1px solid #ff6b35; border-radius: 4px; }
</style>
</head>
<body>
<div class="container">
    <h1>$ admin_setup.sh</h1>
    <p>Generate a bcrypt password hash for your admin panel.</p>

    <?php if ($error): ?>
        <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <?php if ($hash): ?>
        <div class="hash-box">
            <code><?= htmlspecialchars($hash) ?></code>
            <div class="note">Copy this into <code>config.php</code> as <code>ADMIN_PASSWORD_HASH</code></div>
            <div class="danger">⚠ DELETE this file (setup.php) after use. It reveals your password hash.</div>
        </div>
        <form method="get" style="margin-top: 12px;">
            <button type="submit">Generate another</button>
        </form>
    <?php else: ?>
        <form method="post">
            <label for="password">Admin Password</label>
            <input type="password" id="password" name="password" required autofocus
                   minlength="8" placeholder="Enter admin password (min 8 chars)">

            <label for="confirm">Confirm Password</label>
            <input type="password" id="confirm" name="confirm" required
                   placeholder="Confirm password">

            <button type="submit">Generate Hash</button>
        </form>
    <?php endif; ?>
</div>
</body>
</html>
