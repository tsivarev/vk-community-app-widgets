<?
function rooms()
{
    $mysqli = new mysqli('localhost', 'app_connect', 'app123321', 'VKROOMS');
    $mysqli->set_charset("cp1251");

    if ($mysqli->connect_error) {
        die('Ошибка подключения (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
    }

    $res = $mysqli->query("SELECT ID, Name, Location, Photo
                                 FROM Rooms");

    while ($row = $res->fetch_assoc()) {
        print_r($row);
    }
}

rooms();