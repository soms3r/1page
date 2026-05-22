<?php
/**
 * Admin Functions — Auth, CSRF, Settings I/O
 */

// Load config
require_once __DIR__ . '/config.php';

// Start session with strict settings
function initSession(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    session_name(SESSION_NAME);
    session_set_cookie_params([
        'lifetime' => SESSION_LIFETIME,
        'path'     => '/',
        'domain'   => '',
        'secure'   => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();

    // Regenerate session ID periodically to prevent fixation
    if (!isset($_SESSION['_created'])) {
        $_SESSION['_created'] = time();
        session_regenerate_id(true);
    } elseif (time() - $_SESSION['_created'] > SESSION_LIFETIME) {
        session_destroy();
        session_start();
        $_SESSION['_created'] = time();
        session_regenerate_id(true);
    }

    // Check session timeout
    $lastActivity = $_SESSION['_last_activity'] ?? 0;
    if ($lastActivity && (time() - $lastActivity) > SESSION_LIFETIME) {
        session_destroy();
        header('Location: login.php?expired=1');
        exit;
    }
    $_SESSION['_last_activity'] = time();
}

// Check if user is authenticated
function isAuthenticated(): bool {
    return !empty($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;
}

// Require authentication — redirect to login if not
function requireAuth(): void {
    if (!isAuthenticated()) {
        header('Location: login.php?redirect=' . urlencode($_SERVER['REQUEST_URI']));
        exit;
    }
}

// Verify password against stored bcrypt hash
function verifyPassword(string $password): bool {
    return password_verify($password, ADMIN_PASSWORD_HASH);
}

// === CSRF Protection ===

function generateCsrfToken(): string {
    if (empty($_SESSION['_csrf_token'])) {
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf_token'];
}

function validateCsrfToken(string $token): bool {
    return hash_equals($_SESSION['_csrf_token'] ?? '', $token);
}

function csrfField(): string {
    return '<input type="hidden" name="_csrf_token" value="' . htmlspecialchars(generateCsrfToken()) . '">';
}

// === Settings File Operations ===

const SETTINGS_FILES = [
    'site'       => 'site.json',
    'social'     => 'social.json',
    'homepage'   => 'homepage.json',
    'seo'        => 'seo.json',
    'banner'     => 'banner.json',
    'footer'     => 'footer.json',
    'community'  => 'community.json',
    'donation'   => 'donation.json',
    'features'   => 'features.json',
];

const SETTINGS_LABELS = [
    'site'      => 'General',
    'social'    => 'Social Links',
    'homepage'  => 'Homepage',
    'seo'       => 'SEO',
    'banner'    => 'Banner',
    'footer'    => 'Footer',
    'community' => 'Community',
    'donation'  => 'Donation',
    'features'  => 'Features',
];

function getSettingsDir(): string {
    $dir = CONTENT_DIR . '/settings';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

function loadSettingsSection(string $section): ?array {
    $files = SETTINGS_FILES;
    if (!isset($files[$section])) return null;

    $path = getSettingsDir() . '/' . $files[$section];
    if (!file_exists($path)) return null;

    $content = file_get_contents($path);
    if ($content === false) return null;

    $data = json_decode($content, true);
    return is_array($data) ? $data : null;
}

function saveSettingsSection(string $section, array $data): bool {
    $files = SETTINGS_FILES;
    if (!isset($files[$section])) return false;

    $dir = getSettingsDir();
    $path = $dir . '/' . $files[$section];

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) return false;

    // Atomic write: write to temp file, then rename
    $tmp = $path . '.tmp';
    $written = file_put_contents($tmp, $json, LOCK_EX);
    if ($written === false) return false;

    if (function_exists('rename')) {
        // Windows needs to remove the target first if it exists
        if (PHP_OS_FAMILY === 'Windows' && file_exists($path)) {
            unlink($path);
        }
        return rename($tmp, $path);
    }

    return false;
}

function loadAllSettings(): array {
    $result = [];
    foreach (SETTINGS_FILES as $section => $file) {
        $data = loadSettingsSection($section);
        if ($data !== null) {
            $result[$section] = $data;
        }
    }
    return $result;
}

// === Flash Messages ===

function setFlash(string $type, string $message): void {
    $_SESSION['_flash'] = ['type' => $type, 'message' => $message];
}

function getFlash(): ?array {
    if (isset($_SESSION['_flash'])) {
        $flash = $_SESSION['_flash'];
        unset($_SESSION['_flash']);
        return $flash;
    }
    return null;
}

// === Response helpers ===

function jsonResponse(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError(string $message, int $status = 400): void {
    jsonResponse(['success' => false, 'error' => $message], $status);
}

function jsonSuccess(array $extra = []): void {
    jsonResponse(array_merge(['success' => true], $extra));
}

// === Input sanitization ===

function sanitizePath(string $path): string {
    // Remove any directory traversal attempts
    $path = str_replace(['..', './', '\\'], '', $path);
    return basename($path);
}

function truncate(string $str, int $len = 100): string {
    if (mb_strlen($str) <= $len) return $str;
    return mb_substr($str, 0, $len - 3) . '...';
}
