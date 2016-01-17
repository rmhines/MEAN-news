var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  	title: String,
  	link: String,
  	upvotes: {type: Number, default: 0},
  	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.upvote = function(p) {
  	this.upvotes += 1;
  	this.save(p);
};

PostSchema.methods.downvote = function(p) {
  	this.upvotes -= 1;
  	this.save(p);
};

mongoose.model('Post', PostSchema);
