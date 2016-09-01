/**
 * Created by dav on 31.08.16.
 */
var mysql = require('mysql');
var dbConn = require(__dirname + '/db_conn');

module.exports = function(req){
    var callback_ = arguments[arguments.length - 1];
    var status = '';
    var ip = req.ip;
    var option_id = req.body.votefor;
    console.log(req.body);
    var sql_query = '';
    var query_options;
    var option;
    var connection = mysql.createConnection({
        host: dbConn.host,
        user: dbConn.user,
        password: dbConn.password
    });
    connection.connect();
    connection.query('USE votingApp');

    connection.query('SELECT * FROM options WHERE optionsid = ?', [option_id], function(err, result){
        if(err){
            if(err){
                status = 'an error occurred, vote could not be registered';
                console.log(err);
                return callback_(status, null);
            }
        }
        option = result[0];
        if(req.user){
            sql_query = 'SELECT * FROM voted WHERE poll = ? AND user = ?';
            query_options = [option.poll, req.user.userid];
        } else{
            sql_query = 'SELECT * FROM voted WHERE poll = ? AND user_ip = INET6_ATON("' + ip + '")';
            query_options = [option.poll];
        }
        connection.query(sql_query, query_options, function(err, result){
            if(err){
                status = 'an error occurred, vote could not be registered';
                console.log(err);
                return callback_(status, null);
            }
            if(result[0]){
                status = 'You have already voted';
                return callback_(status, null);
            }
            connection.beginTransaction(function(err){
                if(err){
                    status = 'an error occurred, vote could not be registered';
                    console.log(err);
                    return callback_(status, null);
                }
                connection.query('UPDATE options SET votedfor = votedfor + 1 WHERE optionsid = ?', [option_id], function(err, result){
                    if(err){
                        connection.rollback(function(){
                            status = 'an error occurred, vote could not be registered';
                            console.log(err);
                            return callback_(status, null);
                        });
                    }
                    connection.query('UPDATE poll SET voted = voted + 1 WHERE pollid = ?', [option.poll], function(err, result){
                        if(err){
                            connection.rollback(function(){
                                status = 'an error occurred, vote could not be registered';
                                console.log(err);
                                return callback_(status, null);
                            });
                        }
                        if(req.user){
                            sql_query = 'INSERT INTO voted SET poll = ?, user = ?';
                            query_options = [option.poll, req.user.userid];
                        } else{
                            sql_query = 'INSERT INTO voted SET poll = ?, user_ip = INET6_ATON("' + ip + '")';
                            query_options = [option.poll];
                        }
                        connection.query(sql_query, query_options, function(err, result){
                            if(err){
                                connection.rollback(function(){
                                    status = 'an error occurred, vote could not be registered';
                                    console.log(err);
                                    return callback_(status, null);
                                });
                            }
                            connection.commit(function(err){
                                if (err){
                                    connection.rollback(function() {
                                        status = 'an error occurred, vote could not be registered';
                                        console.log(err);
                                        return callback_(status, null);
                                    });
                                }
                                status = 'you voted ' + option.name;
                                console.log(status);
                                connection.end();
                                return callback_(null, status);
                            });
                        });
                    });

                });
            });
        });
    });
}