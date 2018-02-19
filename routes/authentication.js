/**
	This route handler/controller handles all authentication stuff. i.e registration/login/logout
	---------------------------------------------------------------------------------------------
	Get Methods:
	------------
	1) Login
	2) Logout

	Post Methods:
	-------------
	1) User Registration
	2) User Login
**/

var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require("../models");

var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: 'public/assets/images/profile' });

/* renders 'signup' handlebars on get request */
router.get('/signup', function(req, res) {
    res.render('signup');
});

/* renders 'dashboard' handlebars if user's session is active */
/* renders 'signin' handlebars if there is no user session */
router.get('/signin', ensureAuthenticated, function(req, res) {
    res.render('dashboard');
});

/* 'POST' request to register new user */
router.post('/signup', upload.any(), function(req, res, next) {

	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var password = req.body.password;
	var cpassword = req.body.password2;
    var bio	= req.body.bio;
    var image ='';
	
	/* Validating field forms */
	req.checkBody('firstname', 'First name is required').notEmpty();
	req.checkBody('lastname', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('cpassword', 'Password does not match').equals(req.body.password);
	req.checkBody('bio', 'Please tell us something about yourself').notEmpty();

	if(req.files[0] !== undefined){
		var fileExt = validateProfilePic(req.files[0]);
		image = req.files[0].filename;
		var isValid = false;
		
		if( (fileExt == '.jpeg') ||
			(fileExt == '.jpg') ||
			(fileExt == '.png') ) {
			isValid = true;
            image += fileExt;
            fs.renameSync(req.files[0].path, req.files[0].path + fileExt, function(err) {
                if(err) throw err;
            });
		}
		else {
			isValid = false;
		}
	}
	else {
		req.flash('error_msg', 'Setting Up Default Profile Picture');
		image = 'avatar.png';
	}

	var errors = req.validationErrors();
    if(errors) {
        res.render('signup', {
            errors: errors
        });
    }
    else if(isValid === false) {
    	req.flash('error_msg', 'Invalid Profile Picture');
    	fs.unlink(req.files[0].path, function(err){
			if(err) throw err;
		});
    	res.redirect('/authentication/signup');
    }
    else {
    	db.User.findOne({
	       where: {
	           email: email
	       }
	   }).then(function(user){
	        if(user === null){
            
	        	/* Creating new user */
		      	var newUser = {
					firstname: firstname,
					lastname: lastname,
					email: email,
					password: password,
					bio: bio,
					profilepicture: image
				};

				/* Hiding the user's password in the database */
				bcrypt.genSalt(10, function(err, salt) {
					bcrypt.hash(newUser.password, salt, function(err, hash) {
						newUser.password = hash;
				      	db.User.create(newUser).then(function(user) {
							req.flash('success_msg', 'You are registered and can now login');
							res.redirect('/authentication/signin');
				      	});
				  	});
				});
	    	} else {
                req.flash('error_msg', 'Email already registered with us');
                res.redirect('/authentication/signup');
            }
		});	
    };
});

/* 'POST' request to login */
router.post('/signin',
  	passport.authenticate('local', {successRedirect:'/users/dashboard', failureRedirect: '/authentication/signin', failureFlash: true}),
  	function(req, res) {
  		res.flash('error_msg', 'Invalid email or password');
    	req.redirect('/users/dashboard');
  	}
);

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    else {
        res.render('signin');
    }
}

passport.use(new LocalStrategy(
    function(username, password, done) {
        db.User.findOne({
            where: {
                email: username
              }
        }).then(function(user){
            if(user == null || user.dataValues.email !== username){
                return done(null, false, {message: 'Unknown User'});
            }
            else{
                bcrypt.compare(password, user.dataValues.password, function(err, isMatch){
                    if(isMatch){
                        return done(null, user.dataValues);
                    }
                    else{
                        return done(null, false, {message: 'Invalid Password'});
                    }
                });
            }
        });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    db.User.findOne({
        where: {
            id: id
          }
    }).then(function(user){
        done(null, user.dataValues);
    });
});

/* logout: removes user session */
router.get('/signout', function(req, res){
	req.logout();
	res.redirect('/authentication/signin');
});

function validateProfilePic(file) {
	var fileExt = '';
	var type = file.mimetype.trim();
	if( (type === 'image/jpeg') ||
		(type === 'image/jpg') ||
		(type === 'image/png' )) {
		if(file.size > 3000000) {
			return 'invalid';
		}
		else {
			if(file.mimetype == 'image/jpeg') {
				fileExt = ".jpeg";
				return fileExt;
			}
			else if(file.mimetype == 'image/jpg') {
				fileExt = ".jpg";
				return fileExt;
			}
			else if(file.mimetype == 'image/png') {
				fileExt = ".png";
				return fileExt;
			}
		}
	}
	else {
		return 'invalid';
	}
}

module.exports = router;