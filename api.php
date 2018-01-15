<?php

$method = $_GET['method'];

require_once 'api/ApiException.php';
require_once 'api/DB.php';
require_once 'api/Rooms.php';
require_once 'api/Widget.php';
require_once 'api/util.php';

try {
    // TODO: if exists
    api_render_response(call_user_func($method));
} catch (ApiException $e) {
    api_render_error($e->getMessage());
} catch (Exception $e) {
    api_render_error('Internal server error');
}