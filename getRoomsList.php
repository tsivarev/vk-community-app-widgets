<?
header('Content-type: application/json');
echo json_encode(getRooms());

function getRooms()
{
    $dataResult = [
        "status" => "success",
    ];

    $mysqli = new mysqli('localhost', 'app_connect', 'app123321', 'VKROOMS');
    $mysqli->set_charset("utf8");
    if ($mysqli->connect_error) {
        $dataResult["status"] = "error";
        $dataResult["message"] = "$mysqli->connect_errno / $mysqli->connect_error";
    }
    $result = $mysqli->query("SELECT ID id, Name name, Location location, Photo photoLink
                                    FROM Rooms
                                    ORDER BY Location");

    while ($row = $result->fetch_assoc()) {
        $dataResult["data"][] = $row;
    }

    $mysqli->close();
    return $dataResult;
}