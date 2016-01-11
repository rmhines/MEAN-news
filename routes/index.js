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

// Route for preloading post object
router.param('post', function(req, res, next, id) {
	// Uses mongoose's query interface for database interaction
	var query = Post.findById(id);

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

// Route for preloading comment object
router.param('comment', function(req, res, next, id) {
	var query = Comment.findById(id);

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

// Route for returning a single post (and its comments with .populate)
router.get('/posts/:post', function(req, res, next) {
	req.post.populate('comments', function(err, post) {
		if (err) {
			return next(err);
		}

		res.json(req.post);
	});
});

// Route for post upvotes
router.put('/posts/:post/upvote', function(req, res, next) {
	req.post.upvote(function(err, post) {
		if (err) {
			return next(err);
		}

		res.json(post);
	});
});

// Route for post downvotes
router.put('/posts/:post/downvote', function(req, res, next) {
	req.post.downvote(function(err, post) {
		if (err) {
			return next(err);
		}

		res.json(post);
	});
});

// Comments route for a particular post
router.post('/posts/:post/comments', function(req, res, next) {
	var comment = new Comment(req.body);
	comment.post = req.post;

	comment.save(function(err, comment) {
		if (err) {
			return next(err);
		}

		req.post.comments.push(comment);
		req.post.save(function(err, post) {
			if (err) {
				return next(err);
			}
			res.json(comment);
		});
	});
});

// Route for comment upvotes
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
	req.comment.upvote(function(err, comment) {
		if (err) {
			return next(err);
		}

		res.json(comment);
	});
});

// Route for comment downvotes
router.put('/posts/:post/comments/:comment/downvote', function(req, res, next) {
	req.comment.downvote(function(err, comment) {
		if (err) {
			return next(err);
		}

		res.json(comment);
	});
});