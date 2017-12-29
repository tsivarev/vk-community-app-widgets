DELIMITER $$;

CREATE FUNCTION isHoldedNow(room int)
RETURNS INT
BEGIN
	DECLARE nowVar DATETIME DEFAULT NOW();
    IF EXISTS (SELECT ID 
               FROM Holds 
               WHERE room = Holds.RoomID AND
               	 	 nowVar BETWEEN Holds.StartTime AND Holds.FinishTime)
    THEN
    	RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END