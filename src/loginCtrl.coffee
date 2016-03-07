# AngularJS Authentication and Autorization for Django REST Framework
# 
# Copyright 2016 (C) TEONITE - http://teonite.com

angular.module("angularAuth").controller "ExampleLoginCtrl", ['$scope', '$rootScope', '$state', 'Config', 'AuthService', 'CookieService', '$http', '$timeout', ($scope, $rootScope, $state, Config, AuthService, CookieService, $http, $timeout) ->
    $scope.state = $state
    $scope.Config = Config
    $scope.user =
        username: ""
        password: ""

    $scope.login = ->
        AuthService.login($scope.user).then ((result) ->
            CookieService.put('token', result["token"])
            $http.defaults.headers.common["Authorization"] = "Token " + result["token"]
            AuthService.checkAuth().then (user) ->
                $rootScope.user = user
                $rootScope.session = AuthService.createSessionFor user
                $rootScope.$broadcast "loginSuccess"
        ), (errors) ->
            $scope.errors = errors
            delete $rootScope.user
            delete $rootScope.session
            $rootScope.$broadcast "loginFailed"

    $scope.logout = ->
        CookieService.remove('token')
        CookieService.remove('sessionid')
        delete $rootScope.session
        $state.go "login"
]