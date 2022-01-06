<?php require 'includes/_fn.php';

$map = $_GET['map'];
if(isset($map) && !empty($map)) {
    $map = "-{$map}";
} else {
    $map = "";
}

$db = new SQLite3Database("markers$map.db");

$map = [];

$groups = $db->get_rows('SELECT * FROM genshin_map_group');
$markers = $db->get_rows('SELECT * FROM genshin_map_marker');

foreach($groups as $g => $group) {
    $map[$group->uid] = [
        'id' => $group->uid,
        'group' => $group->uid . 'Group',
        'format' => $group->format,
        'markers' => [],
    ];

    if($group->title) {
        $map[$group->uid]['title'] = htmlentities(addslashes($group->title));
    }

    if($group->text) {
        $map[$group->uid]['text'] = htmlentities(addslashes($group->text));
    }

    if($group->guide) {
        $map[$group->uid]['guide'] = $group->guide;
    }

    if($group->icon) {
        $map[$group->uid]['icon'] = $group->icon . 'Icon';
    }

    if($group->checkbox) {
        $map[$group->uid]['checkbox'] = $group->checkbox;
    }
}

foreach($markers as $m => $marker) {
    $map[$marker->mgroup]['markers'][$m] = [
        'id' => $marker->uid,
        'x' => $marker->x,
        'y' => $marker->y,
    ];

    if($marker->title) {
        $map[$marker->mgroup]['markers'][$m]['title'] = htmlentities(addslashes($marker->title));
    }

    if($marker->text) {
        $map[$marker->mgroup]['markers'][$m]['text'] = htmlentities(addslashes($marker->text));
    }

    if($marker->format) {
        $map[$marker->mgroup]['markers'][$m]['format'] = $marker->format;
    }

    if($marker->video) {
        $map[$marker->mgroup]['markers'][$m]['video'] = $marker->video;
    }

    if($marker->guide) {
        $map[$marker->mgroup]['markers'][$m]['guide'] = $marker->guide;
    }

    if($marker->icon) {
        $map[$marker->mgroup]['markers'][$m]['icon'] = $marker->icon . 'Icon';
    }
}

$js = "var markers = [\n";

foreach($map as $group) {
    $js .= "\t{\n";
    $js .= "\t\tid:'{$group['id']}',\n";
    $js .= "\t\tgroup:{$group['group']},\n";
    $js .= "\t\tformat:'{$group['format']}',\n";
    if(isset($group['title'])) {
        $js .= "\t\ttitle:'{$group['title']}',\n";
    }
    if(isset($group['text'])) {
        $js .= "\t\ttext:'{$group['text']}',\n";
    }
    if(isset($group['guide'])) {
        $js .= "\t\tguide:'{$group['guide']}',\n";
    }
    if(isset($group['icon'])) {
        $js .= "\t\ticon:{$group['icon']},\n";
    }
    if(isset($group['checkbox'])) {
        $js .= "\t\tcheckbox:{$group['checkbox']},\n";
    }
    $js .= "\t\tmarkers: [\n";

    foreach($group['markers'] as $marker) {
        $js .= "\t\t\t{\n";
        $js .= "\t\t\t\tid:'{$marker['id']}',\n";
        $js .= "\t\t\t\tcoords:[{$marker['x']},{$marker['y']}],\n";
        if(isset($marker['title'])) {
            $js .= "\t\t\t\ttitle:'{$marker['title']}',\n";
        }
        if(isset($marker['text'])) {
            $js .= "\t\t\t\ttext:'{$marker['text']}',\n";
        }
        if(isset($marker['format'])) {
            $js .= "\t\t\t\tformat:'{$marker['format']}',\n";
        }
        if(isset($marker['video'])) {
            $js .= "\t\t\t\tvideo:'{$marker['video']}',\n";
        }
        if(isset($marker['guide'])) {
            $js .= "\t\t\t\tguide:'{$marker['guide']}',\n";
        }
        if(isset($marker['icon'])) {
            $js .= "\t\t\t\ticon:{$marker['icon']},\n";
        }
        $js .= "\t\t\t},\n";
    }

    $js .= "\t\t],\n";
    $js .= "\t},\n";
}

$js .= "];";

//dd($map);
//dd($js);
dd(str_replace(array("\r", "\n", "\t", "\v"), '', $js) . "\n\n");
