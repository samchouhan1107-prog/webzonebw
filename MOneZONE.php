<?php
/**
 * MOneZONE Short URL Redirect
 * 
 * This file provides a short URL redirect to the main MOneZONE.php file.
 * It ensures easy access to the advertisement filter system.
 * 
 * @version 1.0.0
 * @author WebZoneBW
 * @copyright 2026 WebZoneBW
 */

// Set headers
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');

// Redirect to main MOneZONE.php
header('Location: /MOneZONE.php');
exit;
?>