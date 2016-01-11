var app = angular.module('meanNews', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
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
        });
        $urlRouterProvider.otherwise('home');
    }
]);

app.controller(
    'MainCtrl', [
        '$scope',
        'posts',
        function($scope, posts) {
            $scope.posts = posts.posts;

            $scope.addPost = function() {
                // Prevent users from adding posts with blank titles
                if (!$scope.title || $scope.title === '') {
                    return;
                }
                // Save posts to the server
                posts.create({
                    title: $scope.title,
                    link: $scope.link
                });

                // Reset input field to empty strings when complete
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
    'PostsCtrl', [
        '$scope',
        'posts',
        'post',
        function($scope, posts, post) {
            $scope.post = post;

            $scope.addComment = function () {
                if ($scope.body === '') {
                    return;
                }

                posts.addComment(post._id, {
                    body: $scope.body,
                    author: 'user'
                }).success(function(comment) {
                    $scope.post.comments.push(comment);
                });

                $scope.body = '';
            };

            $scope.incrementUpvotes = function(comment) {
                posts.upvoteComment(post, comment);
            }

            $scope.decrementUpvotes = function(comment) {
                posts.downvoteComment(post, comment);
            }
        }
    ]
);

// Factory service to make posts available across views
// Uses the Angular $http service to query the posts route
app.factory(
    "posts", [
        '$http',
        function($http) {
            var service = {
                posts: []
            };
            
            // Retrieve all posts
            service.getAll = function() {
                // Use success() to define what executes when request returns
                return $http.get('/posts').success(function(data) {
                    angular.copy(data, service.posts);
                });
            };

            // Create new post
            service.create = function(post) {
                return $http.post('/posts', post).success(function(data) {
                    service.posts.push(data);
                });
            };

            // Upvote posts
            service.upvote = function(post) {
                return $http.put('/posts/' + post._id + '/upvote')
                .success(function(data) {
                    post.upvotes += 1;
                });
            };

            // Downvote posts
            service.downvote = function(post) {
                return $http.put('/posts/' + post._id + '/downvote')
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

            // Add comment to a post
            service.addComment = function(id, comment) {
                return $http.post('/posts/' + id + '/comments', comment);
            };

            // Upvote a comment
            service.upvoteComment = function(post, comment) {
                return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
                .success(function(data) {
                    comment.upvotes += 1;
                });
            };

            // Downvote a comment
            service.downvoteComment = function(post, comment) {
                return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote')
                .success(function(data) {
                    comment.upvotes -= 1;
                });
            };

            return service;
        }
    ]
);
