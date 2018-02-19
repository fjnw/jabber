var path = require("path");
var express = require('express');
var router = express.Router();
var models = require('../models');
var db = require("../models");

router.get('/', function(req, res) {
    res.render('index');
});

router.get('/contactus', function(req, res) {
    res.render('contactus');
});

router.post('/contactus', function(req, res) {

	var name = req.body.name;
	var email = req.body.email;
	var contact = req.body.contact;
	var message = req.body.message;

	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').isEmail();
	req.checkBody('contact', 'Contact information is required').notEmpty();
	req.checkBody('message', 'Message is required').notEmpty();

	var errors = req.validationErrors();

    if(errors) {
        res.render('contactus', {errs : errors})
    }
    else {
    	/* Creating new Contact user */
    	 var contactUser = {
			name: name,
			email: email,
			contact: contact,
			message: message
		};

		db.Contact.create(contactUser).then(function(contact){
        	req.flash('success_msg', 'Message successfully sent');
        	res.redirect('/contactus');
   		});
    };
});

module.exports = router;