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

$content = file_get_contents($downloadUrl);

$hash = md5($content);
$tempFilePath = './' . $hash;
file_put_contents($tempFilePath, $content);

$mimetype = (new finfo(FILEINFO_MIME_TYPE))->file($tempFilePath);

unlink($tempFilePath);

header(sprintf('Content-Type: %s;', $mimetype));
echo $content;
