<?php
/**
 * Auth Guard — Include at top of every admin PHP page
 *
 * Usage:
 *   require_once __DIR__ . '/auth.php';
 *   // Page content (only reached if authenticated)
 */

require_once __DIR__ . '/functions.php';
initSession();
requireAuth();
