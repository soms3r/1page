<?php
/**
 * Save Settings API
 *
 * Saves a settings section to a JSON file on the server.
 * Requires authentication and CSRF token.
 *
 * POST /admin/api/save-settings.php
 * Body: _csrf_token=...&section=site&data={json}
 *
 * Response:
 *   { success: true }
 *   { success: false, error: "..." }
 */

require_once __DIR__ . '/../auth.php';

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

// Validate CSRF token
$csrfToken = $_POST['_csrf_token'] ?? '';
if (!validateCsrfToken($csrfToken)) {
    jsonError('Invalid or missing CSRF token.', 403);
}

// Get section key
$section = $_POST['section'] ?? '';
$sections = array_keys(SETTINGS_FILES);
if (!in_array($section, $sections)) {
    jsonError('Invalid section: ' . htmlspecialchars($section), 400);
}

// Get and validate data
$dataJson = $_POST['data'] ?? '';
if (empty($dataJson)) {
    jsonError('No data provided.', 400);
}

$data = json_decode($dataJson, true);
if (!is_array($data)) {
    jsonError('Invalid JSON data.', 400);
}

// Create backup before overwriting
$settingsDir = getSettingsDir();
$filePath = $settingsDir . '/' . SETTINGS_FILES[$section];
if (file_exists($filePath)) {
    $backupDir = $settingsDir . '/backups';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    $backupFile = $backupDir . '/' . date('Ymd-His') . '-' . SETTINGS_FILES[$section];
    copy($filePath, $backupFile);

    // Clean old backups (keep last 10)
    $backups = glob($backupDir . '/[0-9]*-' . preg_quote(SETTINGS_FILES[$section], '/'));
    if ($backups && count($backups) > 10) {
        sort($backups);
        $toDelete = array_slice($backups, 0, count($backups) - 10);
        foreach ($toDelete as $old) {
            @unlink($old);
        }
    }
}

// Save new data
$saved = saveSettingsSection($section, $data);
if (!$saved) {
    jsonError('Failed to write settings file. Check directory permissions.', 500);
}

// Regenerate CSRF token after save
$_SESSION['_csrf_token'] = bin2hex(random_bytes(32));

jsonSuccess([
    'message'    => SETTINGS_LABELS[$section] . ' settings saved.',
    'csrf_token' => $_SESSION['_csrf_token'],
]);
