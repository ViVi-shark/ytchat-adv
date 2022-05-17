<?php

class UrlMissingException extends Exception
{
}

class UnexpectedUrlException extends Exception
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

function getFromYtsheetOld($sheetUrl){
    $content = file_get_contents($sheetUrl);
    $document = DOMDocument::loadHTML($content, LIBXML_NOWARNING | LIBXML_NOERROR);

    foreach ($document->getElementsByTagName('img') as $img) {
        if ($img->attributes != null) {
            $alt = $img->attributes->getNamedItem('alt');
            $src = $img->attributes->getNamedItem('src');

            if ($alt = "キャラクタ画像" && $src != null && $src->textContent != null && $src->textContent != '') {
                return $src->textContent;
            }
        }
        
    }

    return null;
}

function getFromStorytellerActorMemoSheet($id) {
    $sheetLoadingUrl = sprintf('https://s-ammit.sakura.ne.jp/storyteller/core/php/load.php?id=%s', $id);
    $sheetJson = file_get_contents($sheetLoadingUrl);
    $sheet = json_decode($sheetJson, true);

    if (isset($sheet['character_data']['キャラクター']['外見']['オモテの外見']['image:path'])) {
        $imagePath = $sheet['character_data']['キャラクター']['外見']['オモテの外見']['image:path'];
        return sprintf('https://s-ammit.sakura.ne.jp/storyteller/actor-memo-sheet/core/resources/%s', $imagePath);
    }

    return null;
}

function getImageUrl($sheetUrl){
    if (preg_match('/^https:\/\/s-ammit\.sakura\.ne\.jp\/storyteller\/actor-memo-sheet\/([0-9a-f]{64})\/$/', $sheetUrl, $matches)) {
        return getFromStorytellerActorMemoSheet($matches[1]);
    } else if (preg_match('/\/\/character-sheets\.appspot\.com\//', $sheetUrl)) {
        return getFromCharacterSheetSouko($sheetUrl);
    } elseif (preg_match('/\/ytsheet2?\//', $sheetUrl)) {
        return getFromYtsheet2($sheetUrl);
    } elseif (preg_match('/\/\/www\.unhappy\.jp\/trpg\/dx_character\/data\/\d+\.html$/', $sheetUrl)) {
        return getFromYtsheetOld($sheetUrl);
    } else {
        throw new UnexpectedUrlException();
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
catch (UnexpectedUrlException $e) {
    http_response_code(400);
    exit;
}
