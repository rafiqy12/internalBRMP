<?php
// =======================================================
// BRMP DIY - PHP Backend Configuration & Database Bridge
// =======================================================

// Enable CORS and JSON headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database Configuration: Support SQLite (Synology Web Station) in dedicated folder 'database/'
$possibleSqlitePaths = [
    __DIR__ . '/database/absensi.sqlite',
    dirname(__DIR__) . '/database/absensi.sqlite',
    __DIR__ . '/absensi.sqlite'
];

$sqliteFile = null;
foreach ($possibleSqlitePaths as $p) {
    if (file_exists($p)) {
        $sqliteFile = $p;
        break;
    }
}

if (!$sqliteFile) {
    $sqliteFile = __DIR__ . '/database/absensi.sqlite';
    $dbDir = dirname($sqliteFile);
    if (!is_dir($dbDir)) {
        @mkdir($dbDir, 0755, true);
    }
}

$pdo = null;
$useMysql = false;
$isSqlite = false;

// 1. Try MySQL first (Production cPanel / MariaDB environment)
if (!defined('DB_HOST')) define('DB_HOST', 'localhost');
if (!defined('DB_NAME')) define('DB_NAME', 'brmy4429_absensi');
if (!defined('DB_USER')) define('DB_USER', 'brmy4429_userabsen');
if (!defined('DB_PASS')) define('DB_PASS', 'XGs!VX=I1Bmv');
if (!defined('DB_PORT')) define('DB_PORT', '3306');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_SILENT,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 2,
        PDO::ATTR_EMULATE_PREPARES => false
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
    $check = $pdo->query("SHOW TABLES LIKE 't_ptk'");
    if ($check && $check->rowCount() > 0) {
        $useMysql = true;
        $isSqlite = false;
    } else {
        $check2 = $pdo->query("SHOW TABLES LIKE 'tb_pegawai'");
        if ($check2 && $check2->rowCount() > 0) {
            $useMysql = true;
            $isSqlite = false;
        } else {
            // MySQL connected but database is empty
            $useMysql = true;
            $isSqlite = false;
        }
    }
} catch (Exception $e) {
    $pdo = null;
    $useMysql = false;
}

// 2. If MySQL not connected, fallback to SQLite (Synology Web Station / Local development)
if (!$pdo) {
    if ($sqliteFile && (file_exists($sqliteFile) || extension_loaded('pdo_sqlite'))) {
        try {
            $pdo = new PDO("sqlite:" . $sqliteFile, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_SILENT,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 5
            ]);
            $pdo->exec('PRAGMA journal_mode = WAL;');
            $pdo->exec('PRAGMA foreign_keys = ON;');
            $useMysql = true; // DB is ready
            $isSqlite = true;
        } catch (Exception $e) {
            $pdo = null;
            $isSqlite = false;
            $useMysql = false;
        }
    }
}

// Helper: send JSON response
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Helper: get JSON request body
function getJsonBody() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return (isset($GLOBALS['mock_json_body']) && is_array($GLOBALS['mock_json_body'])) ? $GLOBALS['mock_json_body'] : [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// Helper: load fallback pegawai JSON
function getFallbackPegawai() {
    $path = __DIR__ . '/pegawaiData.json';
    if (file_exists($path)) {
        $data = json_decode(file_get_contents($path), true);
        if (is_array($data)) return $data;
    }
    return [];
}

// Helper: save fallback pegawai JSON
function saveFallbackPegawai($data) {
    $path = __DIR__ . '/pegawaiData.json';
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
