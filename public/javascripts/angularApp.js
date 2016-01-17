var app = angular.module('meanNews', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		// Set up a home state
  		$stateProvider.state('home', {
      		url: '/home',
      		templateUrl: '/home.html',
      		controller: 'MainCtrl',
      		resolve: {
    			postPromise: [
    				'posts', 
    				function(posts) {
      					return posts.getAll();
    				}
    			]
  			}
    	}).state('posts', {
  			url: '/posts/{id}',
  			templateUrl: '/posts.html',
  			controller: 'PostsCtrl',
  			resolve: {
    			post: [
    				'$stateParams', 
    				'posts', 
    				function($stateParams, posts) {
      					return posts.get($stateParams.id);
    				}
    			]
  			}
		}).state('login', {
  			url: '/login',
  			templateUrl: '/login.html',
  			controller: 'AuthCtrl',
  			onEnter: ['$state', 'auth', function($state, auth) {
    			if (auth.isLoggedIn()) {
      				$state.go('home');
    			}
  			}]
		}).state('register', {
  			url: '/register',
  			templateUrl: '/register.html',
  			controller: 'AuthCtrl',
  			onEnter: ['$state', 'auth', function($state, auth) {
    			if (auth.isLoggedIn()) {
      				$state.go('home');
    			}
  			}]
		});

  		// For unkown states reroute to home
  		$urlRouterProvider.otherwise('home');
	}
]);

app.controller(
	'MainCtrl', 
	[
		'$scope',
		'posts',
		'auth',
		function($scope, posts, auth) {
  			$scope.posts = posts.posts;
  			$scope.isLoggedIn = auth.isLoggedIn;

			$scope.addPost = function() {
  				if(!$scope.title || $scope.title === '') {
  					return;
  				}
  				if($scope.link && $scope.link !== '') {
  					if (!/^(f|ht)tps?:\/\//i.test($scope.link)) {
      					$scope.link = "http://" + $scope.link;
   					}
  				}
  				posts.create({
    				title: $scope.title,
    				link: $scope.link,
  				});
  				$scope.title = '';
  				$scope.link = '';
			};

			$scope.incrementUpvotes = function(post) {
  				posts.upvote(post);
			};

			$scope.decrementUpvotes = function(post) {
  				posts.downvote(post);
			};
		}
	]
);

app.controller(
	'PostsCtrl', 
	[
		'$scope',
		'posts',
		'post',
		'auth',
		function($scope, posts, post, auth) {
			$scope.post = post;
			$scope.isLoggedIn = auth.isLoggedIn;;

			$scope.addComment = function() {
  				if($scope.body === '') {
  					return;
  				}
  				posts.addComment(post._id, {
    				body: $scope.body,
    				author: 'user',
  				}).success(function(comment) {
    				$scope.post.comments.push(comment);
  				});
  				$scope.body = '';
			};

			$scope.incrementUpvotes = function(comment) {
                posts.upvoteComment(post, comment);
            };

            $scope.decrementUpvotes = function(comment) {
                posts.downvoteComment(post, comment);
            };
		}
	]
);

// Authentication controller
app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth) {
  		$scope.user = {};

  		$scope.register = function() {
    		auth.register($scope.user).error(function(error){
      		$scope.error = error;
    	}).then(function() {
      		$state.go('home');
    	});
  	};

  	$scope.logIn = function() {
    	auth.logIn($scope.user).error(function(error) {
      		$scope.error = error;
    	}).then(function() {
      		$state.go('home');
    	});
  	};
}]);

// Simple navbar controller that exposes isLoggedIn, currentUser,
// and logOut methods from the auth factory
app.controller(
	'NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth) {
  		$scope.isLoggedIn = auth.isLoggedIn;
  		$scope.currentUser = auth.currentUser;
  		$scope.logOut = auth.logOut;
	}
]);

// Auth factory service
app.factory('auth', ['$http', '$window', function($http, $window) {
   	var auth = {};

   	// Setter for user token
	auth.saveToken = function (token) {
	  	$window.localStorage['mean-news-token'] = token;
	};

	// Getter for user token
	auth.getToken = function () {
	  	return $window.localStorage['mean-news-token'];
	};

	// Return true if user is logged in
	auth.isLoggedIn = function() {
	  	var token = auth.getToken();

	  	if(token) {
	    	var payload = JSON.parse($window.atob(token.split('.')[1]));

	    	return payload.exp > Date.now() / 1000;
	  	} else {
	    	return false;
	  	}
	};

	// Returns the username of the currently logged in user
	auth.currentUser = function(){
	  	if(auth.isLoggedIn()) {
	    	var token = auth.getToken();
	    	var payload = JSON.parse($window.atob(token.split('.')[1]));

	    	return payload.username;
	  	}
	};

	// Posts a user to the /register route and saves the returned token
	auth.register = function(user) {
	  	return $http.post('/register', user).success(function(data) {
	    	auth.saveToken(data.token);
	  	});
	};

	// Posts a user to the /login route and saves the returned token
	auth.logIn = function(user) {
	  	return $http.post('/login', user).success(function(data){
	    	auth.saveToken(data.token);
	  	});
	};

	// Log out function that removes the user token from local storage,
	// effectively logging the user out
	auth.logOut = function() {
	  	$window.localStorage.removeItem('mean-news-token');
	};

  	return auth;
}]);

// Uses the Angular $http service to query the posts route
app.factory('posts', [
	'$http',
	'auth',
	function($http, auth) {
  		var service = {
	    	posts: []
		};

		// Retrieve all posts
        service.getAll = function() {
        	// Use success() to define what executes when request returns
            return $http.get('/posts').success(function(data) {
            	// Deep copy ensures global update
                angular.copy(data, service.posts);
            });
        };

        // Create new post
        service.create = function(post) {
            return $http.post('/posts', post, {
            	headers: {
            		Authorization: 'Bearer ' + auth.getToken()
            	}
            }).success(function(data) {
                service.posts.push(data);
            });
        };

        // Upvote posts
        service.upvote = function(post) {
            return $http.put('/posts/' + post._id + '/upvote', null, {
            	headers: {
            		Authorization: 'Bearer ' + auth.getToken()
            	}
            })
        	.success(function(data) {
                post.upvotes += 1;
            });
        };

        // Downvote posts
        service.downvote = function(post) {
            return $http.put('/posts/' + post._id + '/downvote', null, {
            	headers: {
            		Authorization: 'Bearer ' + auth.getToken()
            	}
            })
            .success(function(data) {
                post.upvotes -= 1;
            });
        };

        // Retrieve a single post
        service.get = function(id) {
            return $http.get('/posts/' + id).then(function(res) {
                return res.data
            });
        };

        // Add a comment to a post
        service.addComment = function(id, comment) {
        	return $http.post('/posts/' + id + '/comments', comment, {
        		headers: {
        			Authorization: 'Bearer ' + auth.getToken()
        		}
        	});
        };

        // Upvote a comment attached to a specific post
        service.upvoteComment = function(post, comment) {
  			return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', null, {
  				headers: {
  					Authorization: 'Bearer ' + auth.getToken()
  				}
  			})
    		.success(function(data){
      			comment.upvotes += 1;
    		});
		};

		// Downvote a comment attached to a specific post
        service.downvoteComment = function(post, comment) {
  			return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/downvote', null, {
  				headers: {
  					Authorization: 'Bearer ' + auth.getToken()
  				}
  			})
    		.success(function(data){
      			comment.upvotes -= 1;
    		});
		};

		return service;
	}
]);
