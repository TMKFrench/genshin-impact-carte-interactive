<?php require 'includes/_fn.php';

$operator = (isset($_GET['op']) && !empty($_GET['op'])) ? $_GET['op'] : null;
$quantity = (isset($_GET['qt']) && !empty($_GET['qt'])) ? $_GET['qt'] : null;

if(!$operator || !$quantity) {
    return;
}

$db = new SQLite3Database('markers.db');
$markers = $db->get_rows('SELECT id, x, y, uid, mgroup FROM genshin_map_marker');

$updates = "## ---------- Updates ---------- ##\n\n";

foreach($markers as $m) {
    if($operator == 'plus') {
        $x = $m->x + $quantity;
        $y = $m->y + $quantity;
    } elseif($operator == 'minus') {
        $x = $m->x - $quantity;
        $y = $m->y - $quantity;
    }
    $updates .= "UPDATE genshin_map_marker SET x = '{$x}', y = '{$y}' WHERE id = '{$m->id}';\n";
}

dd($updates);
