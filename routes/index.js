var express = require('express');
var get_polls = require('../config/get_polls');
module.exports = function(app, passport){
    /* GET home page. */
    app.get('/voting_app', function(req, res) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated()){
            res.redirect('/user');
        } else{
            get_polls(null, function(err, result){
                if(err || result.length == 0){
                    res.render('index.ejs', { login_message: req.flash('loginMessage'), signup_message_fail: req.flash('signupMessageFail'), signup_message_success: req.flash('signupMessageSuccess'), polls: null, nopolls: 'There are no polls' });
                } else {
                    res.render('index.ejs', { login_message: req.flash('loginMessage'), signup_message_fail: req.flash('signupMessageFail'), signup_message_success: req.flash('signupMessageSuccess'), polls: result, nopolls: '' });
                }
            });
        }

    });

    app.get('/my_polls', isLoggedIn, function(req, res){
        get_polls(req.user.userid, function(err, result){
            if(err || result.length == 0){
                res.render('user.ejs', { username: req.user.username, polls: null, nopolls: 'You have no polls', owner: 'Below are your polls.' });
            } else {
                res.render('user.ejs', { username: req.user.username, polls: result, nopolls: '', owner: 'Below are your polls.' });
            }
        });
    });

    app.get('/new_poll', isLoggedIn, function(req, res){
        res.render('new_poll.ejs', { username: req.user.username, create_poll_fail: '', create_poll_success: '' });
    });

    app.get('/user', isLoggedIn, function(req, res) {
        get_polls(null, function(err, result){
            if(err || result.length == 0){
                res.render('user.ejs', { username: req.user.username, polls: null, nopolls: 'There are no polls', owner: 'Below are polls hosted by voting-app.' });
            } else {
                res.render('user.ejs', { username: req.user.username, polls: result, nopolls: '', owner: 'Below are polls hosted by voting-app.' });
            }
        });
    });

    app.get('/log_out', function(req, res) {
        req.logout();
        res.redirect('/voting_app');
    });

    // process the login form
    app.post('/log_in', passport.authenticate('local-login', {
        successRedirect : '/user?status=log_in_success', // redirect to the secure profile section
        failureRedirect : '/voting_app?status=log_in_fail', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/sign_up', passport.authenticate('local-signup', {
        successRedirect : '/voting_app?status=sign_up_success', // redirect to the secure profile section
        failureRedirect : '/voting_app?status=sign_up_fail', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/new_poll', function(req, res){
        require('../config/create_poll')(req, function(err, success){
            if(err){
                res.render('new_poll.ejs', { username: req.user.username, create_poll_fail: err, create_poll_success: '' });
            } else{
                res.render('new_poll.ejs', { username: req.user.username, create_poll_fail: '', create_poll_success: success });
            }
        });
    });


};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/voting_app');
}