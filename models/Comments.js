var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	body: String,
	author: String,
	upvotes: { 
		type: Number, 
		default: 0 
	},
	post: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Post' 
	}
});

CommentSchema.methods.upvote = function(commentParam) {
	this.upvotes += 1;
	this.save(commentParam);
};

CommentSchema.methods.downvote = function(commentParam) {
	this.upvotes -= 1;
	this.save(commentParam);
};

mongoose.model('Comment', CommentSchema);
