<?php
/**
 * Admin Dashboard
 *
 * Authenticated landing page that redirects to the settings panel.
 * The settings panel uses the existing Next.js UI with PHP backend.
 */

require_once __DIR__ . '/auth.php';

// Redirect to settings (existing Next.js page)
header('Location: /admin/settings/');
exit;
