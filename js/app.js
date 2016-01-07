var app = angular.module('meanNews', []);

// Use a factory to store single instance of all posts
app.factory("posts", [
    function() {
        var service = {
            posts: []
        };
        return service;
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
                upvotes: 0
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
    }]
);
