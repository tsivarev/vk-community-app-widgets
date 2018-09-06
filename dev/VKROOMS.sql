-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Май 15 2018 г., 14:19
-- Версия сервера: 5.7.22-0ubuntu0.16.04.1
-- Версия PHP: 7.0.30-0ubuntu0.16.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `VKROOMS`
--

DELIMITER $$
--
-- Функции
--
CREATE DEFINER=`root`@`localhost` FUNCTION `isHoldedNow` (`room` INT) RETURNS INT(11) BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `roomFreeTime` (`room` INT) RETURNS VARCHAR(50) CHARSET utf8 BEGIN
	DECLARE Answer VARCHAR(50) DEFAULT '';
    DECLARE nowVar DATETIME DEFAULT NOW();
    IF NOT EXISTS (SELECT ID
                   FROM Holds
                   WHERE room = Holds.RoomID AND
                   		 nowVar > Holds.StartTime AND
                   		 YEAR(nowVar) = YEAR(Holds.StartTime) AND
                   		 MONTH(nowVar) = MONTH(Holds.StartTime) AND
                   		 DAYOFMONTH(nowVar) = DAYOFMONTH(Holds.StartTime))     THEN
    	IF EXISTS (SELECT ID
                   FROM Holds
                   WHERE room = Holds.RoomID AND
                  		 DATE(DATE_ADD(nowVar, INTERVAL 1 DAY)) BETWEEN DATE(Holds.StartTime) AND DATE(Holds.FinishTime))         THEN
        	SET Answer = " до завтра";
        ELSEIF EXISTS (SELECT ID
                       FROM Holds
                       WHERE room = Holds.RoomID AND
                      		 nowVar < Holds.StartTime)         THEN
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
                      LIMIT 1);     END IF;
    RETURN (Answer);
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `roomHoldText` (`room` INT) RETURNS VARCHAR(70) CHARSET utf8 BEGIN
	DECLARE Answer VARCHAR(70) DEFAULT '';
    DECLARE nowVar DATETIME DEFAULT NOW();
    IF EXISTS (SELECT ID 
               FROM Holds 
               WHERE room = Holds.RoomID AND
               	 	 nowVar BETWEEN Holds.StartTime AND Holds.FinishTime)     THEN
    	SET Answer = (SELECT CONCAT('Сейчас занята. Освободится в ', DATE_FORMAT(Holds.FinishTime, "%H:%i"))
                      FROM Holds
					  WHERE room = Holds.RoomID AND
                     		nowVar BETWEEN Holds.StartTime AND Holds.FinishTime
                      ORDER BY Holds.finishTime DESC
                      LIMIT 1);
    ELSE
        SET Answer = (SELECT CONCAT('Свободна', roomFreeTime(room))
                      FROM DUAL);
    END IF;
    RETURN (Answer);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Структура таблицы `Holds`
--

CREATE TABLE `Holds` (
  `ID` int(11) NOT NULL,
  `RoomID` int(11) NOT NULL,
  `HolderVkID` int(11) NOT NULL,
  `StartTime` datetime NOT NULL,
  `FinishTime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `Holds`
--

INSERT INTO `Holds` (`ID`, `RoomID`, `HolderVkID`, `StartTime`, `FinishTime`) VALUES
(1, 1, 12345123, '2018-01-01 00:00:00', '2018-01-01 22:00:00'),
(2, 1, 12223, '2017-12-26 22:00:00', '2017-12-26 22:30:00'),
(3, 2, 1112, '2017-12-27 13:00:00', '2017-12-27 15:00:00'),
(4, 3, 22, '2017-12-29 14:00:00', '2017-12-29 14:30:00'),
(5, 2, 1, '2017-12-28 02:00:00', '2017-12-28 05:00:00'),
(6, 2, 1, '2017-12-29 03:00:00', '2017-12-29 05:00:00'),
(7, 2, 1, '2017-12-27 02:00:00', '2017-12-27 05:00:00'),
(8, 3, 1, '2017-12-27 16:00:00', '2017-12-27 23:30:00'),
(9, 4, 12333, '2017-12-28 22:00:00', '2017-12-28 23:00:00'),
(10, 2, 1, '2017-12-29 00:00:00', '2017-12-29 03:00:00'),
(11, 2, 1, '2017-12-29 05:00:00', '2017-12-29 05:30:00'),
(12, 2, 1, '2017-12-29 05:30:00', '2017-12-29 06:30:00'),
(13, 2, 1, '2017-12-29 13:30:00', '2017-12-29 14:30:00'),
(14, 2, 1, '2017-12-29 17:00:00', '2017-12-29 19:30:00'),
(15, 2, 1, '2017-12-29 21:00:00', '2017-12-29 22:00:00'),
(16, 2, 1, '2017-12-29 22:30:00', '2017-12-29 23:59:00');

-- --------------------------------------------------------

--
-- Структура таблицы `Rooms`
--

CREATE TABLE `Rooms` (
  `ID` int(11) NOT NULL,
  `Name` varchar(30) NOT NULL,
  `Location` varchar(10) DEFAULT NULL,
  `Photo` varchar(255) DEFAULT '',
  `WIDGET_COVER_ID` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `Rooms`
--

INSERT INTO `Rooms` (`ID`, `Name`, `Location`, `Photo`, `WIDGET_COVER_ID`) VALUES
(1, 'Оранжевая', '5 этаж', 'images/oranjevaya.jpg', ''),
(2, 'Пингвинятник', '5 этаж', 'images/pingvinyatnik.jpg', ''),
(3, 'Казанская', '6 этаж', 'images/kazanskaya.jpg', ''),
(4, 'Маленькая', '6 этаж', 'images/malenkaya.jpg', ''),
(5, 'Проекторная', '6 этаж', 'images/proektornaya.jpg', ''),
(6, 'Круглая', '7 этаж', 'images/kryglaya.jpg', ''),
(7, 'Пыточная', '7 этаж', 'images/pytochnaya.jpg', '');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `Holds`
--
ALTER TABLE `Holds`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_HoldsRooms` (`RoomID`);

--
-- Индексы таблицы `Rooms`
--
ALTER TABLE `Rooms`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `Holds`
--
ALTER TABLE `Holds`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
--
-- AUTO_INCREMENT для таблицы `Rooms`
--
ALTER TABLE `Rooms`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `Holds`
--
ALTER TABLE `Holds`
  ADD CONSTRAINT `FK_HoldsRooms` FOREIGN KEY (`RoomID`) REFERENCES `Rooms` (`ID`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
