var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

// "GET" route for retrieving posts
// req - Contains all request info made to the server
// res - Object used to respond to the client
router.get('/posts', function(req, res, next) {
	// Query the database for all posts
	Post.find(function(err, posts) {
		if (err) {
			return next(err);
		}

		// If no errors, send the retrieved posts back to the client
		res.json(posts);
	});
});

// "POST" route for creating posts
router.post('/posts', function(req, res, next) {
	// Use mongoose to create a new post object
	var post = new Post(req.body);

	// If no errors, save the post to the database
	post.save(function(err, post) {
		if (err) {
			return next(err);
		}

		res.json(post);
	});
});
