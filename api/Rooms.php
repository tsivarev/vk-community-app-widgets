<?php

function rooms_hold_periods()
{
    $request_body = api_get_body();
    $hold_date = $request_body->{'date'};
    $db_date_format = 'Y-m-d H:i:s';
    $frontend_date_format = 'd.m.Y H:i';
    $db = new DB();
    $prepared_statement = $db->prepare('INSERT INTO Holds (RoomID, HolderVkID, StartTime, FinishTime)
                                                VALUES (?, ?, ?, ?)');
    $statement_params = array(
        'roomId' => array(
            'type' => 'i',
            'value' => $request_body->{'roomId'},
        ),
        'userVkId' => array(
            'type' => 'i',
            'value' => $request_body->{'userVkId'},
        ),
    );
    foreach ($request_body->{'periods'} as $period) {
        $start_time = DateTime::createFromFormat($frontend_date_format, $hold_date . ' ' . $period->{'startTime'});
        $finish_time = DateTime::createFromFormat($frontend_date_format, $hold_date . ' ' . $period->{'finishTime'});

        $statement_params['startTime'] = array(
            'type' => 's',
            'value' => $start_time->format($db_date_format),
        );
        $statement_params['finishTime'] = array(
            'type' => 's',
            'value' => $finish_time->format($db_date_format),
        );
        $db->execute_statement($prepared_statement, $statement_params);
    }
    return true;
}

function rooms_get_rooms()
{
    $db = new DB();
    $query_result = $db->query('SELECT ID id, Name name, Location location, Photo photoLink,
                                                isHoldedNow(ID) statusCode, roomHoldText(ID) statusText
                                         FROM Rooms
                                         ORDER BY Location');
    return $db->get_data_from_query($query_result);
}

function rooms_get_hold_period()
{
    $params = api_get_params(array(
        'roomId' => 'integer',
        'date' => 'date',
    ));
    $db = new DB();
    $prepared_statement = $db->prepare('SELECT StartTime startTime, FinishTime finishTime
                                                  FROM Holds
                                                  WHERE Holds.RoomID = ? AND
                                                        DATE_FORMAT(StartTime, ?) = ?
                                                  ORDER BY StartTime');
    $statement_params = array(
        'roomId' => array(
            'type' => 'i',
            'value' => $params['roomId'],
        ),
        'startTimeDateFormat' => array(
            'type' => 's',
            'value' => '%d.%m.%Y',
        ),
        'date' => array(
            'type' => 's',
            'value' => $params['date'],
        ),
    );
    $db->execute_statement($prepared_statement, $statement_params);
    return $db->get_data_from_statement($prepared_statement);
}