<?php
/**
 * Admin Configuration — copy to config.php and fill in
 *
 * Paths:
 *   PHP files:     public_html/admin/
 *   Content JSON:  public_html/content/settings/
 *   Static site:   public_html/ (out from Next.js build)
 */

// === REQUIRED: Admin password (bcrypt hash) ===
// Generate via: php setup.php (then delete setup.php after use)
define('ADMIN_PASSWORD_HASH', '$2y$12$...');

// === REQUIRED: Session security ===
// Generate: php -r "echo bin2hex(random_bytes(32));"
define('SESSION_SECRET', 'change-this-to-64-hex-chars');

// === Content directory (writable by web server) ===
// config.php is at public_html/admin/config.php
// __DIR__ is /path/to/public_html/admin/
// dirname(__DIR__) is /path/to/public_html/
// content dir is /path/to/public_html/content/
define('CONTENT_DIR', dirname(__DIR__) . '/content');

// === OPTIONAL: GitHub sync ===
define('GITHUB_TOKEN',  '');         // GitHub Personal Access Token
define('GITHUB_OWNER',  'soms3r');   // Your GitHub username
define('GITHUB_REPO',   '1page');    // Repository name
define('GITHUB_BRANCH', 'main');     // Branch to commit to

// === Session lifetime (seconds) ===
define('SESSION_LIFETIME', 7200); // 2 hours
define('SESSION_NAME', 'ADMIN_SESSION');
