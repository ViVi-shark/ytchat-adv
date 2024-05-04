<?php

if (empty($_GET['url'])) {
    http_response_code(403);
    exit(1);
}

$assetOriginalUrl = $_GET['url'];

if (preg_match('/^https?:\/\/drive\.google\.com\/file\/d\/(.+?)\//', $assetOriginalUrl, $matches)) {
    $downloadUrl = sprintf('https://drive.google.com/uc?id=%s', $matches[1]);
} else if (preg_match('/^https?:\/\/drive\.google\.com\/uc\?(?:.+&)?id=(.+?)(?:$|&)/', $assetOriginalUrl, $matches)) {
    $downloadUrl = sprintf('https://drive.google.com/uc?id=%s', $matches[1]);
} else {
    http_response_code(500);
    exit(1);
}

$indexHash = md5(file_get_contents('../../index.cgi'));
$cacheKey = $indexHash . '-' . md5($downloadUrl);
$temporaryFilePath = './../../.asset-cache/' . $cacheKey;

if (file_exists($temporaryFilePath)) {
    $content = file_get_contents($temporaryFilePath);
} else {
    $content = file_get_contents($downloadUrl);
    file_put_contents($temporaryFilePath, $content);
}

$mimetype = (new finfo(FILEINFO_MIME_TYPE))->file($temporaryFilePath);

header(sprintf('Content-Type: %s;', $mimetype));
echo $content;
