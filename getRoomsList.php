<?
header('Content-type: application/json');
echo json_encode(getRooms());

function getRooms()
{
    try {
        $dataResult = [
            "status" => "success",
        ];

        $mysqli = new mysqli('localhost', 'app_connect', 'app123321', 'VKROOMS');
        $mysqli->set_charset("utf8");
        if ($mysqli->connect_error) {
            throw new Exception("[$mysqli->connect_errno]: $mysqli->connect_error");
        }

        $result = $mysqli->query("SELECT ID id, Name name, Location location, Photo photoLink,
                                           isHoldedNow(ID) statusCode, roomHoldText(ID) statusText
                                    FROM Rooms
                                    ORDER BY Location");
        if(!$result) {
            throw new Exception($mysqli->error);
        }

        while ($row = $result->fetch_assoc()) {
            $dataResult["data"][] = $row;
        }

    } catch (Exception $exception) {
        $dataResult["status"] = "error";
        $dataResult["message"] = $exception->getMessage();
    }
    $mysqli->close();

    return $dataResult;
}