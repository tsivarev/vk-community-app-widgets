<?
header("Content-type: application/json");

$roomData = json_decode($_GET['data']);
echo json_encode(getRoomStatus($roomData));

function getRoomStatus($roomData)
{
    try {
        $dataResult = [
            "status" => "success",
        ];

        $mysqli = new mysqli("localhost", 'app_connect', 'app123321', 'VKROOMS');
        $mysqli->set_charset("utf8");
        if ($mysqli->connect_error) {
            throw new Exception("[$mysqli->connect_errno]: $mysqli->connect_error");
        }

        $requestedDate = $roomData->{"date"};
        $requestedRoomId = $roomData->{"roomId"};
        $result = $mysqli->query("SELECT StartTime startTime, FinishTime finishTime
                                        FROM Holds
                                        WHERE Holds.RoomID = \"$requestedRoomId\" AND
                                              DATE_FORMAT(StartTime, \"%d.%m.%Y\") = \"$requestedDate\"
                                        ORDER BY StartTime");
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