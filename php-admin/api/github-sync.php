<?php
/**
 * GitHub Sync API
 *
 * Commits the current settings JSON files to GitHub repository.
 * Token is stored server-side only — never exposed to browser.
 *
 * POST /admin/api/github-sync.php
 * Body: _csrf_token=...
 *
 * Response:
 *   { success: true, message: "...", commitUrl: "..." }
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

// Check GitHub config
if (empty(GITHUB_TOKEN)) {
    jsonError('GitHub token not configured. Set GITHUB_TOKEN in config.php.', 503);
}

if (empty(GITHUB_OWNER) || empty(GITHUB_REPO)) {
    jsonError('GitHub repository not configured. Set GITHUB_OWNER and GITHUB_REPO in config.php.', 503);
}

$owner = GITHUB_OWNER;
$repo  = GITHUB_REPO;
$branch = defined('GITHUB_BRANCH') && GITHUB_BRANCH ? GITHUB_BRANCH : 'main';

// Load all settings and build commit payloads
$settingsDir = getSettingsDir();
$filesToCommit = [];
$commitMessage = 'Admin: update settings ' . date('Y-m-d H:i:s T');

foreach (SETTINGS_FILES as $section => $filename) {
    $filePath = $settingsDir . '/' . $filename;
    if (!file_exists($filePath)) continue;

    $content = file_get_contents($filePath);
    if ($content === false) continue;

    $gitPath = 'content/settings/' . $filename;
    $filesToCommit[] = [
        'path'    => $gitPath,
        'content' => $content,
    ];
}

if (empty($filesToCommit)) {
    jsonError('No settings files found to sync.', 404);
}

// Build the tree items and get current commit SHA
$apiBase = "https://api.github.com/repos/{$owner}/{$repo}";
$headers = [
    'Authorization: Bearer ' . GITHUB_TOKEN,
    'Content-Type: application/json',
    'Accept: application/vnd.github+json',
    'User-Agent: TLOGZ-Admin/1.0',
];

try {
    // 1. Get the latest commit SHA on the branch
    $refUrl = "{$apiBase}/git/ref/heads/{$branch}";
    $refData = gitRequest('GET', $refUrl, null, $headers);

    if (!isset($refData['object']['sha'])) {
        throw new RuntimeException('Could not get branch ref');
    }
    $latestCommitSha = $refData['object']['sha'];

    // 2. Get the tree SHA from the latest commit
    $commitUrl = "{$apiBase}/git/commits/{$latestCommitSha}";
    $commitData = gitRequest('GET', $commitUrl, null, $headers);

    $baseTreeSha = $commitData['tree']['sha'] ?? null;
    if (!$baseTreeSha) {
        throw new RuntimeException('Could not get base tree SHA');
    }

    // 3. Create a new tree with updated files
    $treeItems = [];
    foreach ($filesToCommit as $file) {
        $treeItems[] = [
            'path'    => $file['path'],
            'mode'    => '100644',
            'type'    => 'blob',
            'content' => $file['content'],
        ];
    }

    $treeUrl = "{$apiBase}/git/trees";
    $treeData = gitRequest('POST', $treeUrl, json_encode([
        'base_tree' => $baseTreeSha,
        'tree'      => $treeItems,
    ]), $headers);

    $newTreeSha = $treeData['sha'] ?? null;
    if (!$newTreeSha) {
        throw new RuntimeException('Could not create new tree');
    }

    // 4. Create a commit
    $commitReqUrl = "{$apiBase}/git/commits";
    $commitReqData = gitRequest('POST', $commitReqUrl, json_encode([
        'message' => $commitMessage,
        'tree'    => $newTreeSha,
        'parents' => [$latestCommitSha],
    ]), $headers);

    $newCommitSha = $commitReqData['sha'] ?? null;
    if (!$newCommitSha) {
        throw new RuntimeException('Could not create commit');
    }

    // 5. Update the branch reference
    $updateUrl = "{$apiBase}/git/refs/heads/{$branch}";
    gitRequest('PATCH', $updateUrl, json_encode([
        'sha'   => $newCommitSha,
        'force' => false,
    ]), $headers, false);

    $commitUrl = "https://github.com/{$owner}/{$repo}/commit/{$newCommitSha}";

    // Regenerate CSRF token
    $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));

    jsonSuccess([
        'message'    => count($filesToCommit) . ' settings files synced to GitHub.',
        'commitUrl'  => $commitUrl,
        'csrf_token' => $_SESSION['_csrf_token'],
    ]);

} catch (Exception $e) {
    jsonError('GitHub sync failed: ' . $e->getMessage(), 500);
}

/**
 * Perform a GitHub API request using cURL.
 */
function gitRequest(string $method, string $url, ?string $body, array $headers, bool $decode = true): mixed {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
    ]);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
    } elseif ($method === 'PATCH') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        if ($body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
    } elseif ($method === 'GET') {
        curl_setopt($ch, CURLOPT_HTTPGET, true);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        throw new RuntimeException('cURL error: ' . $error);
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        $detail = '';
        if ($decode && $response) {
            $parsed = json_decode($response, true);
            $detail = $parsed['message'] ?? $parsed['error'] ?? '';
        }
        throw new RuntimeException("GitHub API error ({$httpCode}): " . ($detail ?: $response));
    }

    if ($decode && $response) {
        return json_decode($response, true) ?? $response;
    }

    return $response;
}
