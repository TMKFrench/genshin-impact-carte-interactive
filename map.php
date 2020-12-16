<?php

if(!isset($_SERVER['PATH_INFO'])){
    header("HTTP/1.0 404 Not Found");
    print "Please specify a tile path";
    exit();
}

require_once('includes/sstiles/sstiles.php');

$parts = explode('/',$_SERVER['PATH_INFO']);
//
$y = array_pop($parts);
$x = array_pop($parts);
$zoom = array_pop($parts);

$t = new sstiles('assets/img/map.jpg',$zoom,$x,$y,'scale','./cache');
$t->sendTile();
