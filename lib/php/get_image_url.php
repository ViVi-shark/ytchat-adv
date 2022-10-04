<?php

$content = file_get_contents($_GET['sheet'].'&mode=json');
$decoded = json_decode($content);

print($decoded->imageURL);

exit;