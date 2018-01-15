<?php

const COMMUNITY_ACCESS_TOKEN = '22d530b18b6305c938a6a69cc127ef9627bb0745fb355eccae1f741c647dbc008b915d5c4efaab63af95e';
const VK_API_VERSION = '5.69';
const COUNT_IMAGES_TO_GET = 3;
const LARGE_IMAGE_TYPE = '510x128';

function widget_update() {
    $params = api_get_params(array(
        'code' => 'string',
        'type' => 'text',
    ));

    $request_params = array(
        'code' => $params['code'],
        'type' => $params['type'],
        'access_token' => COMMUNITY_ACCESS_TOKEN,
        'v' => VK_API_VERSION,
    );

    $request_params = http_build_query($request_params);
    $result = file_get_contents('https://api.vk.com/method/appWidgets.update?' . $request_params);
    return $result;
}

function widget_upload_image() {
    $request_params = array(
        'image_type' => LARGE_IMAGE_TYPE,
        'access_token' => COMMUNITY_ACCESS_TOKEN,
        'v' => VK_API_VERSION,
    );

    $get_params = http_build_query($request_params);
    $upload_url = file_get_contents('https://api.vk.com/method/appWidgets.getGroupImageUploadServer?' . $get_params);
    $upload_url = json_decode($upload_url)->{'response'}->{'upload_url'};

    $ch = curl_init($upload_url);
    $data = array('image' => '@' . __DIR__ . '\..\images\oras.jpg');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $res = json_decode(curl_exec($ch));
    curl_close($ch);

    if (!$res || $res->{'response'}->{'error'}) {
        throw new Exception('Ошибка изображения');
    }

    $request_params = array(
        'hash' => $res->{'hash'},
        'image' => $res->{'image'},
        'access_token' => COMMUNITY_ACCESS_TOKEN,
        'v' => VK_API_VERSION,
    );
    $res = file_get_contents('https://api.vk.com/method/appWidgets.saveGroupImage?'.http_build_query($request_params));
    $res = json_decode($res);

    if (!$res || $res->{'response'}->{'error'}) {
        throw new Exception('Ошибка загрузки изображения на сервер');
    }
    return $res->{'response'}->{'id'};
}

function widget_get_images() {
    $request_params = array(
        'offset' => 0,
        'count' => COUNT_IMAGES_TO_GET,
        'image_type' => LARGE_IMAGE_TYPE,
        'access_token' => COMMUNITY_ACCESS_TOKEN,
        'v' => VK_API_VERSION,
    );

    $get_params = http_build_query($request_params);
    $result = file_get_contents('https://api.vk.com/method/appWidgets.getGroupImages?' . $get_params);


    return $result;
}