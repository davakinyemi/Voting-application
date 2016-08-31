var mysql = require('mysql');
var dbConn = require(__dirname + '/db_conn');

module.exports = function(user){
    var callback_ = arguments[arguments.length - 1];
    var status = '';
    var sql_query;
    if(user){
        sql_query = 'SELECT * FROM poll WHERE user = ' + user + ' ORDER BY pollid DESC';
    } else{
        sql_query = 'SELECT * FROM poll ORDER BY pollid DESC';
    }


    var connection = mysql.createConnection({
        host: dbConn.host,
        user: dbConn.user,
        password: dbConn.password
    });
    connection.connect();
    connection.query('USE votingApp');

    connection.query(sql_query, function(err, result) {
        if (err){
            status = 'an error occurred';
            return callback_(status, null);
        }
        console.log(result);
        connection.end();
        return callback_(null, result);
    });
}