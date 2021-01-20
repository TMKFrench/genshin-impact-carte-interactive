<?php require_once 'includes/_fn.php';

$config = parse_ini_file("config.ini", true);
$db = new SQLite3Database('gici.db');

@session_start();

$method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO'])?$_SERVER['PATH_INFO']:'';
$request = explode('/', trim($path_info,'/'));
$root = $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] . str_replace('api.php', '', $_SERVER['SCRIPT_NAME']);
$action = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
$id = sanitize(preg_replace('/[^a-z0-9_]+/i','',array_shift($request)));

if($method == 'GET' && $action == 'login') {

    $params = array(
        'client_id' => $config['discord']['client_id'],
        'redirect_uri' => $root . 'api/code',
        'response_type' => 'code',
        'scope' => 'identify'
    );

    // Redirect the user to Discord's authorization page
    header('Location: ' . $config['discord']['url_authorize'] . '?' . http_build_query($params));
    die();

//    echo "<a href=\"https://lbmgaming.eu.auth0.com/authorize?response_type=token&client_id=Xt4G1EO4SgEj3aDw7e2VZXVlFjxvcnfx&connection=CONNECTION&redirect_uri=\">Login</a>";
} elseif($method == 'GET' && $action == 'code') {
    $token = apiRequest($config['discord']['url_token'], array(
        "grant_type" => "authorization_code",
        'client_id' => $config['discord']['client_id'],
        'client_secret' => $config['discord']['client_secret'],
        'redirect_uri' => $root . 'api/code',
        'code' => $_GET['code']
    ));
    $logout_token = $token->access_token;
    $_SESSION['access_token'] = $token->access_token;

    $user = apiRequest($config['discord']['url_user']);
    $data = [
        'uid' => $user->id,
        'username' =>  $user->username . '#' . $user->discriminator,
        'avatar' =>  'https://cdn.discordapp.com/avatars/' . $user->id . '/' . $user->avatar . '.png',
        'avatar_default' => 'https://cdn.discordapp.com/embed/avatars/' . ($user->discriminator % 5) . '.png',
        'logout' => $root . 'api/logout'
    ];

    $_SESSION['user'] = $data;

    header('Location: ' . $root);
    die();
} elseif($method == 'GET' && $action == 'user') {
    header('Content-Type: application/json');

    $dbCountUsers = $db->get_row("SELECT COUNT(*) AS total FROM users");

    if(!session('visited')){
        $counter = (int) file_get_contents('hits.txt') + 1;
        file_put_contents('hits.txt', $counter);
    } else {
        $counter = (int) file_get_contents('hits.txt');
    }

    $_SESSION['visited'] = TRUE;

    if($user = session('user')) {

        $dbUser = $db->get_row("SELECT * FROM users WHERE uid = {$user['uid']}");
        if(!$dbUser) {
            $db->insert('users', [
                'uid' => $user['uid'],
                'created_at' => date('Y-m-d H:i:s'),
                'last_login' => date('Y-m-d H:i:s')
            ]);
        } else {
            $db->update('users', [ 'last_login' => date('Y-m-d H:i:s') ], [ 'uid' => $user['uid'] ]);
        }

        $user['menu'] = ($dbUser) ? json_decode($dbUser->menu) : [];
        $user['markers'] = ($dbUser) ? json_decode($dbUser->markers) : [];
        $user['users'] = $dbCountUsers->total;
        $user['visits'] = $counter;

        echo json_encode($user);
        die();
    }

    echo json_encode(['login' => $root . 'api/login', 'users' => $dbCountUsers->total, 'visits' => $counter]);
    die();

} elseif($method == 'POST' && $action == 'addmarker') {
    header('Content-Type: application/json');

    if($user = session('user')) {

        $dbUser = $db->get_row("SELECT * FROM users WHERE uid = {$user['uid']}");
        $user['menu'] = json_decode($dbUser->menu);
        $user['markers'] = json_decode($dbUser->markers);

        if(!in_array($id, $user['markers'])) {
            $user['markers'][] = $id;
            $db->update('users', ['markers' => json_encode($user['markers'])], ['uid' => $user['uid']]);
        }

        echo json_encode($user);
        die();
    }

    echo json_encode(['error' => 'Utilisateur introuvable...']);
    die();
} elseif($method == 'POST' && $action =='removemarker') {
    header('Content-Type: application/json');

    if($user = session('user')) {

        $dbUser = $db->get_row("SELECT * FROM users WHERE uid = {$user['uid']}");
        $user['menu'] = json_decode($dbUser->menu);
        $user['markers'] = json_decode($dbUser->markers);

        if($user['markers'] && in_array($id, $user['markers'])) {
            $k = array_search($id, $user['markers']);
            array_splice($user['markers'], $k, 1);

            $db->update('users', ['markers' => json_encode($user['markers'])], ['uid' => $user['uid']]);
        }

        echo json_encode($user);
        die();
    }

    echo json_encode(['error' => 'Utilisateur introuvable...']);
    die();
} elseif($method == 'POST' && $action == 'resetmarkers') {
    header('Content-Type: application/json');

    if($user = session('user')) {

        $dbUser = $db->get_row("SELECT * FROM users WHERE uid = {$user['uid']}");
        if($dbUser) {
            $db->update('users', ['markers' => json_encode([])], ['uid' => $user['uid']]);
        }

        echo json_encode($user);
        die();
    }

    echo json_encode(['error' => 'Utilisateur introuvable...']);
    die();
} elseif($method == 'GET' && $action == 'logout') {
    session_destroy();
    header('Location: ' . $root);
    die();
} elseif($method == 'POST' && $action == 'addmenu') {
    if($user = session('user')) {
        $dbUser = $db->get_row("SELECT * FROM users WHERE uid = {$user['uid']}");
        if($dbUser) {
            $menu = json_decode($dbUser->menu);
            if(!in_array($id, $menu)) {
                $menu[] = $id;
                $db->update('users', ['menu' => json_encode($menu)], ['uid' => $user['uid']]);
            }
        }
    }

    die();
} elseif($method == 'POST' && $action == 'removemenu') {
    if($user = session('user')) {
        $dbUser = $db->get_row("SELECT * FROM users WHERE uid = {$user['uid']}");
        if($dbUser) {
            $menu = json_decode($dbUser->menu);
            if(in_array($id, $menu)) {
                $k = array_search($id, $menu);
                array_splice($menu, $k, 1);

                $db->update('users', ['menu' => json_encode($menu)], ['uid' => $user['uid']]);
            }
        }
    }

    die();
} else {
    echo json_encode(['method' => $method, 'action' => $action, 'id' => $id]);
}
