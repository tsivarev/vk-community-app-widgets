<?php

const APP_HOST = 'localhost';
const APP_DB_USER = 'app_connect';
const APP_DB_PASSWORD = 'app123321';
const APP_DB_NAME = 'VKROOMS';

class DB
{
    private $mysqli = null;

    public function __construct($hostname = APP_HOST, $db_user = APP_DB_USER, $db_password = APP_DB_PASSWORD, $db_name = APP_DB_NAME)
    {
        $this->mysqli = new mysqli($hostname, $db_user, $db_password, $db_name);
        $this->mysqli->set_charset('utf8');
        if ($this->mysqli->connect_error) {
            throw new Exception($this->mysqli->connect_errno . ': ' . $this->mysqli->connect_error);
        }
    }

    public function __destruct()
    {
        $this->mysqli->close();
    }

    public function query($query_string)
    {
        $result = $this->mysqli->query($query_string);

        if (!$result) {
            throw new Exception($this->mysqli->error);
        }
        return $result;
    }

    public function prepare($query_string)
    {
        $statement = $this->mysqli->prepare($query_string);

        if (!$statement) {
            throw new Exception('Не удалось подготовить запрос');
        }
        return $statement;
    }

    public function execute_statement($statement, &$params)
    {
        $types = '';
        $param_values = array();
        foreach ($params as $statement_key => $statement_value) {
            $types .= $params[$statement_key]['type'];
            $param_values[$statement_key] = &$params[$statement_key]['value'];
        }
        call_user_func_array(array($statement, 'bind_param'), array_merge(array($types), $param_values));
        $statement->execute();
    }

    public function get_data_from_statement($statement)
    {
        $result = null;

        $statementResult = $statement->get_result();
        while ($row = $statementResult->fetch_assoc()) {
            $result[] = $row;
        }
        return $result;
    }

    public function get_data_from_query($query)
    {
        $result = null;

        while ($row = $query->fetch_assoc()) {
            $result[] = $row;
        }
        if (!$result) {
            throw new ApiException('Пустой результат');
        }
        return $result;
    }
}