var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
	title: String,
	link: String,
	upvotes: {type: Number, default: 0},
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.upvote = function(postParam) {
	this.upvotes += 1;
	this.save(postParam);
};

PostSchema.methods.downvote = function(postParam) {
	this.upvotes -= 1;
	this.save(postParam);
};

mongoose.model('Post', PostSchema);
