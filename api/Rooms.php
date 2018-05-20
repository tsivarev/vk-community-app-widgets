<?php

function rooms_hold_periods() {
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
    
    $response = array();
    
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
        
        $db_raw_response = array(
            'startTime' => $start_time->format($frontend_date_format),
            'finishTime' => $finish_time->format($frontend_date_format),
            'holdId' => $prepared_statement->insert_id,
            'holder' => $request_body->{'userVkId'},
        );
        array_push($response, $db_raw_response);
    }
    return $response ? $response : array();
}

function rooms_discard_hold() {
    $params = api_get_params(array(
        'holdId' => 'integer',
    ));
    
    $db = new DB();
    $prepared_statement = $db->prepare('DELETE
                                        FROM Holds
                                        WHERE ID = ?');
    $statement_params = array(
        'holdId' => array(
            'type' => 'i',
            'value' => $params['holdId'],
        ),
    );
    $db->execute_statement($prepared_statement, $statement_params);
    return 'success';
}

function rooms_get_all() {
    $db = new DB();
    $query_result = $db->query('SELECT ID id, Name name, Location location, Photo photoLink,
                                        isHoldedNow(ID) statusCode, roomHoldText(ID) statusText,
                                        WIDGET_COVER_ID coverId
                                 FROM Rooms
                                 ORDER BY Location');
    $response = $db->get_data_from_query($query_result);
    return $response ? $response : array();
}

function rooms_get_all_by_hold() {
    $db = new DB();
    $query_result = $db->query('SELECT r.ID id, r.Name name, r.Location location, r.Photo photoLink,
                                        isHoldedNow(r.ID) statusCode, roomHoldText(r.ID) statusText,
                                        r.WIDGET_COVER_ID coverId, (SELECT HoldTime FROM Holds WHERE RoomID = r.ID ORDER BY HoldTime DESC LIMIT 1) HoldTime
                                 FROM Rooms r
                                 ORDER BY HoldTime DESC
                                 LIMIT 3');
    $response = $db->get_data_from_query($query_result);
    return $response ? $response : array();
}

function rooms_get_hold_period() {
    $params = api_get_params(array(
        'roomId' => 'integer',
        'date' => 'date',
    ));
    $db = new DB();
    $prepared_statement = $db->prepare('SELECT ID holdId, StartTime startTime, FinishTime finishTime, HolderVkID holder
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
    $response = $db->get_data_from_statement($prepared_statement);
    return $response ? $response : array();
}

function rooms_add_new() {
    $params = api_get_params(array(
        'name' => 'string',
        'location' => 'string',
        'photoLink' => 'string',
    ));
    $db = new DB();
    $prepared_statement = $db->prepare('INSERT INTO Rooms (Name, Location, Photo)
                                                VALUES (?, ?, ?)');
    $statement_params = array(
        'roomId' => array(
            'type' => 's',
            'value' => $params['name'],
        ),
        'location' => array(
            'type' => 's',
            'value' => $params['location'],
        ),
        'photo' => array(
            'type' => 's',
            'value' => $params['photoLink'],
        ),
    );
    $db->execute_statement($prepared_statement, $statement_params);
    $response = $db->get_data_from_statement($prepared_statement);
    return $response ? $response : array();
}