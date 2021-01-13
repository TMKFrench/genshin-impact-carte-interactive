<?php include 'includes/WideImage/WideImage.php';

$file = (isset($_SERVER['PATH_INFO'])) ? htmlspecialchars(explode('/', $_SERVER['PATH_INFO'])[1]) : null;

if(!$file || !file_exists("assets/img/medias/{$file}.jpg")) {
    $image = WideImage::load("assets/img/medias/default.jpg");
    $image->output('jpg');
}

if(file_exists("cache/{$file}.jpg")) {
    $image = WideImage::load("cache/{$file}.jpg");
    $image->output('jpg');
} else {
    $image = WideImage::load("assets/img/medias/{$file}.jpg");
    $cropped = $image->crop('center', 'center', 300, 300);
    $cropped->saveToFile("cache/{$file}.jpg", 75);
    $cropped->output('jpg', 75);
}
