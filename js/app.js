var app = angular.module('meanNews', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainCtrl'
        }).state('posts', {
            url: '/posts/{id}',
            templateUrl: '/posts.html',
            controller: 'PostsCtrl'
        });
        $urlRouterProvider.otherwise('home');
    }
]);

app.controller('MainCtrl', [
    '$scope',
    'posts',
    function($scope, posts) {
        $scope.posts = posts.posts;

        $scope.addPost = function() {
            // Prevent users from adding posts with blank titles
            if (!$scope.title || $scope.title === '') {
                return;
            }
            $scope.posts.push({
                title: $scope.title,
                link: $scope.link,
                upvotes: 0,
                comments: [
                    {author: 'Joe', body: 'Cool post!', upvotes: 3},
                    {author: 'Bob', body: 'Great idea, but...', upvotes: -1},
                ]
            });

            // Reset input field to empty strings
            $scope.title = '';
            $scope.link = '';
        }

        $scope.incrementUpvotes = function(post) {
            post.upvotes += 1;
        }

        $scope.decrementUpvotes = function(post) {
            post.upvotes -= 1;
        }
    }
]);

app.controller('PostsCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    function($scope, $stateParams, posts) {
        $scope.post = posts.posts[$stateParams.id];

        $scope.addComment = function () {
            if ($scope.body === '') {
                return;
            }
            $scope.post.comments.push({
                body: $scope.body,
                author: 'user',
                upvotes: 0
            });
            $scope.body = '';
        };
    }
]);

// Factory service to make posts available across views
app.factory("posts", [
    function() {
        var service = {
            posts: []
        };
        return service;
    }
]);
