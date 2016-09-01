/**
 * Created by dav on 29.08.16.
 */
var mysql = require('mysql');
var dbConn = require(__dirname + '/db_conn');

module.exports = function(req){
    var callback_ = arguments[arguments.length - 1];

    var connection = mysql.createConnection({
        host: dbConn.host,
        user: dbConn.user,
        password: dbConn.password
    });
    connection.connect();
    connection.query('USE votingApp');

    var user = req.user.userid;
    var title = req.body.title;
    var options = replaceEmptyOpts(req.body.options.split('\n'));
    console.log(options);
    if (options == undefined || options.length < 2) {
        return callback_('please add more options', null);
    }

    connection.beginTransaction(function(err) {
        var status = '';
        if(err){
            status = 'an error occured';
            console.log(err);
            return callback_(status, null);
        }
        connection.query('INSERT INTO poll SET user = ?, title = ?', [user, title], function (err, result) {
            var status = '';
            var id = result.insertId;
            if (err){
                connection.rollback(function() {
                    status = 'an error occurred';
                    console.log(err);
                    return callback_(status, null);
                });
            } else{
                connection.query('SELECT * FROM poll WHERE pollid = ?', [id], function(err, result){
                    if (err){
                        connection.rollback(function() {
                            status = 'an error occurred';
                            console.log(err);
                            return callback_(status, null);
                        });
                    }
                    var sql_query = 'INSERT INTO options (poll, name) VALUES ?';
                    var values = [];
                    for(var i = 0; i < options.length; i++){
                        values.push([result[0].pollid, options[i]]);
                    }
                    console.log(values);
                    connection.query(sql_query, [values], function(err, result){
                        if (err){
                            connection.rollback(function() {
                                status = 'an error occurred';
                                console.log(err);
                                return callback_(status, null);
                            });
                        }
                        connection.commit(function(err){
                            if (err){
                                connection.rollback(function() {
                                    status = 'an error occurred';
                                    console.log(err);
                                    return callback_(status, null);
                                });
                            }
                            status = 'poll has been created';
                            console.log(status);
                            connection.end();
                            return callback_(null, status);
                        });
                    });
                });
            }
        });
    });
}

function replaceEmptyOpts(options){
    var arr = [];
    for(var i = 0; i < options.length; i++){
        var opt = options[i].trim();
        if(opt.length > 0){
            console.log('opt: ' + opt);
            arr.push(opt);
        }
    }
    return arr;
}

