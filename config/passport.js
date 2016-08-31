var crypto = require('crypto');
var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('mysql');
var dbConn = require(__dirname + '/db_conn');

var connection = mysql.createConnection({
    host: dbConn.host,
    user: dbConn.user,
    password: dbConn.password
});

connection.query('USE votingApp');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log(JSON.stringify(user));
        if(user.id){
            done(null, user.id);
        } else if(user.userid){
            done(null, user.userid);
        }
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query('SELECT * FROM users WHERE userid = ?', [id], function(err, result){
            done(err, result[0]);
        });
    });


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            if(password.length < 5){
                console.log('password should be longer than 4 letters.');
                return done(null, false, req.flash('signupMessageFail', 'password should be longer than 4 letters.'));
            }
            if(username.length < 5){
                console.log('username should be longer than 4 letters.');
                return done(null, false, req.flash('signupMessageFail', 'username should be longer than 4 letters.'));
            }
            connection.query('SELECT * FROM users WHERE username = ?', [username],function(err, result){
                if (err){
                    console.log('query error');
                    return done(err);
                }
                if (result.length) {
                    console.log('username is already taken.');
                    return done(null, false, req.flash('signupMessageFail', 'username is already taken.'));
                } else {
                    // if there is no user with that email
                    // create the user
                    var newUserMysql = new Object();

                    newUserMysql.username = username;

                    var salt = Math.round((new Date().valueOf() * Math.random())) + '';
                    var hashpassword = crypto.createHash('sha512')
                        .update(salt + password, 'utf8')
                        .digest('hex');

                    newUserMysql.password = hashpassword; // use the generateHash function in our user model

                    connection.query('INSERT INTO users SET username = ?, password = ?, salt = ?', [username, hashpassword, salt], function(err, result) {
                        if (err){
                            console.log('query error');
                            return done(err);
                        }
                        newUserMysql.id = result.insertId;
                        console.log('sign up success');
                        return done(null, newUserMysql);
                    });
                }
            });
        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form

            connection.query('SELECT * FROM users WHERE username = ?', [username],function(err, result){
                if (err)
                    return done(err);
                if (!result.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                var newhash = crypto.createHash('sha512')
                    .update(result[0].salt + password, 'utf8')
                    .digest('hex');

                if (result[0].password != newhash)
                    return done(null, false, req.flash('loginMessage', 'Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, result[0]);

            });



        }));

};