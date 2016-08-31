var mysql = require('mysql');
var dbConn = require(__dirname + '/db_conn');

module.exports = function(id){
    var callback_ = arguments[arguments.length - 1];
    var status = '';
    console.log('id ' + id);

    var connection = mysql.createConnection({
        host: dbConn.host,
        user: dbConn.user,
        password: dbConn.password
    });
    connection.connect();
    connection.query('USE votingApp');

    connection.query('SELECT * FROM poll WHERE pollid = ?', [id], function(err, result) {
        if (err || result.length == 0){
            status = 'an error occurred';
            console.log(err);
            return callback_(status, null, null);
        }
        var poll_stats = result[0];
        connection.query('SELECT * FROM options WHERE poll = ?', [poll_stats.pollid], function(err, result){
            if (err){
                status = 'an error occurred';
                console.log(err);
                return callback_(status, null, null);
            }
            console.log(result);
            connection.end();
            return callback_(null, poll_stats, result);
        });
    });
}