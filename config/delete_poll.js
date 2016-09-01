/**
 * Created by dav on 01.09.16.
 */
var mysql = require('mysql');
var dbConn = require(__dirname + '/db_conn');

module.exports = function(req) {
    var callback_ = arguments[arguments.length - 1];

    var connection = mysql.createConnection({
        host: dbConn.host,
        user: dbConn.user,
        password: dbConn.password
    });
    connection.connect();
    connection.query('USE votingApp');

    var user = req.user.userid;
    var poll = req.query.num;
    var status = '';

    connection.query('SELECT * FROM poll WHERE pollid = ? AND user = ?', [poll, user], function(err, result){
        if(err){
            status = 'an error occurred, poll could not be removed';
            console.log(err);
            return callback_(status, null);
        }
        if(result[0]){
            connection.beginTransaction(function(err){
                if(err){
                    status = 'an error occurred, poll could not be removed';
                    console.log(err);
                    return callback_(status, null);
                }
                connection.query('DELETE FROM voted WHERE poll = ?', [poll], function(err, result){
                    if(err){
                        connection.rollback(function(){
                            status = 'an error occurred, poll could not be removed';
                            console.log(err);
                            return callback_(status, null);
                        });
                    }
                    connection.query('DELETE FROM options WHERE poll = ?', [poll], function(err, result){
                        if(err){
                            connection.rollback(function(){
                                status = 'an error occurred, poll could not be removed';
                                console.log(err);
                                return callback_(status, null);
                            });
                        }
                        connection.query('DELETE FROM poll WHERE pollid = ?', [poll], function(err, result){
                            if(err){
                                connection.rollback(function(){
                                    status = 'an error occurred, poll could not be removed';
                                    console.log(err);
                                    return callback_(status, null);
                                });
                            }
                            connection.commit(function(err){
                                if (err){
                                    connection.rollback(function() {
                                        status = 'an error occurred, poll could not be removed';
                                        console.log(err);
                                        return callback_(status, null);
                                    });
                                }
                                status = 'poll has been removed';
                                console.log(status);
                                connection.end();
                                return callback_(null, status);
                            });
                        });
                    });
                });
            });
        } else {
            status = 'poll cannot be removed';
            console.log(err);
            return callback_(status, null);
        }
    });
}