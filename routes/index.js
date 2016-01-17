var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');
var mongoose = require('mongoose');
var router = express.Router();
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

module.exports = router;

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

// GET route for home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET route for posts
// req - Contains all request info made to the server
// res - Object used to respond to the client
router.get('/posts', function(req, res, next) {
  	Post.find(function(err, posts){
    	if(err) {
    		return next(err);
    	}

    	res.json(posts);
  	});
});

// POST route for creating posts
router.post('/posts', auth, function(req, res, next) {
  	var post = new Post(req.body);
  	post.author = req.payload.username;

  	post.save(function(err, post){
    	if(err) {
    		return next(err);
    	}

    	res.json(post);
  	});
});

// Route for preloading post objects
// Use Express's param() function to automatically load objects
router.param('post', function(req, res, next, id) {
  	var query = Post.findById(id);

  	// Use mongoose's query interface to interact with database
  	query.exec(function (err, post) {
    	if (err) {
    		return next(err);
    	}
    	if (!post) {
    		return next(new Error('Unable to locate post.'));
    	}

    	req.post = post;
    	return next();
  	});
});

// Route for preloading comment objects
// Use Express's param() function to automatically load objects
router.param('comment', function(req, res, next, id) {
  	var query = Comment.findById(id);

  	// Use mongoose's query interface to interact with database
  	query.exec(function (err, comment) {
    	if (err) {
    		return next(err);
    	}
    	if (!comment) {
    		return next(new Error('Unable to locate comment.'));
    	}

    	req.comment = comment;
    	return next();
  	});
});


// GET route for returning a single post
router.get('/posts/:post', function(req, res) {
  	// Use populate function to retreive comments along with posts
  	req.post.populate('comments', function(err, post) {
    	if (err) {
    		return next(err);
    	}

    	res.json(post);
  	});
});

// PUT route for upvoting a post
router.put('/posts/:post/upvote', auth, function(req, res, next) {
  	req.post.upvote(function(err, post){
    	if (err) {
    		return next(err);
    	}

    	res.json(post);
  	});
});

// PUT route for downvoting a post
router.put('/posts/:post/downvote', auth, function(req, res, next) {
  	req.post.downvote(function(err, post){
    	if (err) {
    		return next(err);
    	}

    	res.json(post);
  	});
});

// PUT route for upvoting a comment
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
  	req.comment.upvote(function(err, comment){
    	if (err) {
    		return next(err);
    	}

    	res.json(comment);
  	});
});

// PUT route for downvoting a comment
router.put('/posts/:post/comments/:comment/downvote', auth, function(req, res, next) {
  	req.comment.downvote(function(err, comment){
    	if (err) {
    		return next(err);
    	}

    	res.json(comment);
  	});
});

// POST route for commenting -- sets author of comment
router.post('/posts/:post/comments', auth, function(req, res, next) {
  	var comment = new Comment(req.body);
  	comment.post = req.post;
  	comment.author = req.payload.username;

  	comment.save(function(err, comment){
    	if(err){
    		return next(err);
    	}

    	req.post.comments.push(comment);
    	req.post.save(function(err, post) {
	      	if(err){
	      		return next(err);
	      	}

	      	res.json(comment);
	    });
  	});
});

// POST route for creating a user given a username and password
router.post('/register', function(req, res, next) {
  	if(!req.body.username || !req.body.password) {
    	return res.status(400).json({message: 'Please fill out all fields.'});
  	}

  	var user = new User();

  	user.username = req.body.username;

  	user.setPassword(req.body.password)

  	user.save(function (err) {
    	if(err) {
    		return next(err);
    	}

    	return res.json({token: user.generateJWT()})
  	});
});

// POST route for authenticating the user and returning a token
router.post('/login', function(req, res, next) {
  	if(!req.body.username || !req.body.password) {
    	return res.status(400).json({message: 'Please fill out all fields.'});
  	}

  	passport.authenticate('local', function(err, user, info) {
    	if(err) {
    		return next(err);
    	}

    	if(user) {
      		return res.json({token: user.generateJWT()});
    	} else {
      		return res.status(401).json(info);
    	}
  	})(req, res, next);
});

// Use Express's param() function to automatically load object
router.param('post', function(req, res, next, id) {
  	var query = Post.findById(id);

  	// Use mongoose's query interface to interact with database
  	query.exec(function (err, post) {
    	if (err) {
    		return next(err);
    	}
    	if (!post) {
    		return next(new Error('Unable to find post.'));
    	}

    	req.post = post;
    	return next();
  	});
});


