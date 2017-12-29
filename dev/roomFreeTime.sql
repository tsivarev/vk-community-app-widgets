DELIMITER $$;

CREATE FUNCTION roomFreeTime(room INT)
RETURNS VARCHAR(50)
BEGIN
	DECLARE Answer VARCHAR(50) DEFAULT '';
    DECLARE nowVar DATETIME DEFAULT NOW();
    IF NOT EXISTS (SELECT ID
                   FROM Holds
                   WHERE room = Holds.RoomID AND
                   		 nowVar > Holds.StartTime AND
                   		 YEAR(nowVar) = YEAR(Holds.StartTime) AND
                   		 MONTH(nowVar) = MONTH(Holds.StartTime) AND
                   		 DAYOFMONTH(nowVar) = DAYOFMONTH(Holds.StartTime)) -- сегодня свободна
    THEN
    	IF EXISTS (SELECT ID
                   FROM Holds
                   WHERE room = Holds.RoomID AND
                  		 DATE(DATE_ADD(nowVar, INTERVAL 1 DAY)) BETWEEN DATE(Holds.StartTime) AND DATE(Holds.FinishTime)) -- -свободна до завтра
        THEN
        	SET Answer = " до завтра";
        ELSEIF EXISTS (SELECT ID
                       FROM Holds
                       WHERE room = Holds.RoomID AND
                      		 nowVar < Holds.StartTime) -- -свободна до даты
        THEN
        	SET Answer = (SELECT CONCAT(" до ", DATE_FORMAT(Holds.StartTime, "%d.%m.%Y")) 
                          FROM Holds
						  WHERE room = Holds.RoomID AND
								nowVar < Holds.StartTime
                          ORDER BY Holds.StartTime
						  LIMIT 1);        
        END IF;
    ELSE
    	SET Answer = (SELECT CONCAT(' до ', HOUR(StartTime), ':', MINUTE(StartTime))
                      FROM Holds
                      WHERE nowVar < StartTime
                      ORDER BY StartTime
                      LIMIT 1); -- Время во сколько освободится сегодня.
    END IF;
    RETURN (Answer);
END