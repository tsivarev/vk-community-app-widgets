<?php

function api_get_body()
{
    $json = $_POST['json'];
    return json_decode($json);
}

function api_get_params($annotations)
{
    $result = array();
    $requestedData = json_decode($_GET['data']);
    foreach ($annotations as $name => $annotation) {
        switch ($annotation) {
            case 'integer':
                $result[$name] = intval($requestedData->{$name});
                break;
            case 'date':
                $dateFormat = 'd.m.Y';
                $date = $requestedData->{$name};
                $formatedDate = DateTime::createFromFormat($dateFormat, $date);
                //TODO: запрет на прошедшее время
                if ($formatedDate && $formatedDate->format($dateFormat) == $date) {
                    $result[$name] = $date;
                } else {
                    throw new Exception();
                }
        }
    }
    return $result;
}

function api_render_error($msg)
{
    api_render_response(array('error' => $msg));
}

function api_render_response($response)
{
    header('Content-Type: application/json');
    $json = json_encode($response);
    echo $json;
    exit;
}