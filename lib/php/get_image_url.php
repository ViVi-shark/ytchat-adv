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

class SourceServerException extends Exception
{
}

class FragmentSystemSettingsFileNotFoundException extends SourceServerException
{
    public function __construct(string $settingsFileUrl)
    {
        parent::__construct(sprintf('File `%s` is not found.', $settingsFileUrl));
    }
}

class FragmentSystemInvalidSettingsFileException extends SourceServerException
{
    public function __construct(string $settingsUrl)
    {
        parent::__construct(sprintf('Invalid settings file. ( %s )', $settingsUrl));
    }
}

/**
 * @throws FragmentSystemSettingsFileNotFoundException
 * @throws FragmentSystemInvalidSettingsFileException
 */
function getFromFragmentSystemCharacterSheet(
    string $sourceUrl,
    string $characterId
): ?string
{
    $storageUrlSettingsFileUrl = preg_replace('/\/(bloodorium|wefl)\/make\.htm.+$/', '/js/url.js', $sourceUrl);
    $storageUrlSettings = file_get_contents($storageUrlSettingsFileUrl);
    if ($storageUrlSettings === FALSE) {
        throw new FragmentSystemSettingsFileNotFoundException($storageUrlSettingsFileUrl);
    }
    if (preg_match('/^var\s+itemapiturl\s*=\s*"(.+?)"\s*;\s*$/m', $storageUrlSettings, $matches)) {
        $storageUrlBase = $matches[1];
    } else {
        throw new FragmentSystemInvalidSettingsFileException($storageUrlSettingsFileUrl);
    }

    $systemCodeSettingsFileUrl = preg_replace('/\/make\.htm.+$/', '/js/systemcode.js', $sourceUrl);
    $systemCodeSettings = file_get_contents($systemCodeSettingsFileUrl);
    if ($systemCodeSettings === FALSE) {
        throw new FragmentSystemSettingsFileNotFoundException($storageUrlSettingsFileUrl);
    }
    if (preg_match('/^var\s+systemcode\s*=\s*"(.+?)"\s*;\s*$/', $systemCodeSettings, $matches)) {
        $systemCode = $matches[1];
    } else {
        throw new FragmentSystemInvalidSettingsFileException($systemCodeSettingsFileUrl);
    }

    $url = sprintf(
        '%s%s/%s',
        $storageUrlBase,
        $systemCode,
        $characterId,
    );

    $characterJson = file_get_contents($url);
    $character = json_decode($characterJson, true);

    if (
        !is_array($character) ||
        !array_key_exists('Item', $character) ||
        !array_key_exists('imageurl', $character['Item'])
    ) {
        return null;
    }

    $cloudImageUrl = $character['Item']['imageurl'];

    if (strlen($cloudImageUrl ?? '') === 0) {
        return null;
    }

    if (preg_match('/^https?:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_\-.]+)(\/(view\?usp=(sharing|(share|drive)_link)(&|$)|edit))?/', $cloudImageUrl, $matches)) {
        $contentId = $matches[1];
        return sprintf('https://drive.google.com/uc?id=%s', $contentId);
    } else if (preg_match('/https:\/\/www\.dropbox\.com\/s\/.+[?&]dl=[01]/', $cloudImageUrl, $matches)) {
        return preg_replace('/([?&])dl=[01](&|$)/', '$1dl=1$2', $cloudImageUrl);
    }

    return null;
}

/**
 * @throws SourceServerException
 */
function getImageUrl($sheetUrl): ?string
{
    if (preg_match('/^https:\/\/s-ammit\.sakura\.ne\.jp\/storyteller\/actor-memo-sheet\/([0-9a-f]{64})\/$/', $sheetUrl, $matches)) {
        return getFromStorytellerActorMemoSheet($matches[1]);
    } else if (preg_match('/https:\/\/www\.fragment-sys\.com\/(bloodorium|wefl)\/make\.html\?id=(\d+)/', $sheetUrl, $matches)) {
        return getFromFragmentSystemCharacterSheet($sheetUrl, $matches[2]);
    } else if (preg_match('/\/\/character-sheets\.appspot\.com\//', $sheetUrl)) {
        return getFromCharacterSheetSouko($sheetUrl);
    } else {
        return getFromYtsheet2($sheetUrl);
    }
}

try {
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
catch (SourceServerException $e) {
    http_response_code(500);
    exit;
}
