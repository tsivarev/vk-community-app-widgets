DELIMITER $$;

CREATE FUNCTION roomHoldText(room INT)
RETURNS VARCHAR(70)
BEGIN
	DECLARE Answer VARCHAR(70) DEFAULT '';
    DECLARE nowVar DATETIME DEFAULT NOW();
    IF EXISTS (SELECT ID 
               FROM Holds 
               WHERE room = Holds.RoomID AND
               	 	 nowVar BETWEEN Holds.StartTime AND Holds.FinishTime) -- сейчас занята 
    THEN
    	SET Answer = (SELECT CONCAT('Сейчас занята. Освободится в ', DATE_FORMAT(Holds.FinishTime, "%H:%i")) 
                      FROM Holds
					  WHERE room = Holds.RoomID AND
                     		nowVar BETWEEN Holds.StartTime AND Holds.FinishTime
                      -- ORDER BY Holds.finishTime DESC
                      LIMIT 1); 
    ELSE
        SET Answer = (SELECT CONCAT('Свободна', roomFreeTime(room))
                      FROM DUAL);
    END IF;
    RETURN (Answer);
END