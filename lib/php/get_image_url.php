<?php

class UrlMissingException extends Exception
{
}

const KEY_OF_URL = 'sheet';

function getFromYtsheet2($sheetUrl){
    $content = file_get_contents($sheetUrl.'&mode=json');
    $decoded = json_decode($content);
    return $decoded->imageURL;
}

function getFromCharacterSheetSouko($sheetUrl){
    $imageUrl = preg_replace('/\\/edit\.html\?/', '/image?', $sheetUrl).'&'.time();

    $bin = file_get_contents($imageUrl);
    $encoded = base64_encode($bin);

    return 'data:image/png;base64,'.$encoded;
}

function getImageUrl($sheetUrl){
    if (preg_match('/\/\/character-sheets\.appspot\.com\//', $sheetUrl)) {
        return getFromCharacterSheetSouko($sheetUrl);
    } else {
        return getFromYtsheet2($sheetUrl);
    }
}

try
{
    if (!array_key_exists(KEY_OF_URL, $_GET) || $_GET[KEY_OF_URL] == null) {
        throw new UrlMissingException();
    } else {
        $sheetUrl = $_GET[KEY_OF_URL];
    }

    print(getImageUrl($sheetUrl));

    exit;
}
catch (UrlMissingException $e) {
    http_response_code(404);
    exit;
}
