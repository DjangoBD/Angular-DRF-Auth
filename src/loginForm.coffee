# AngularJS Authentication and Autorization for Django REST Framework
# 
# Copyright 2016 (C) TEONITE - http://teonite.com

angular.module("angularAuth").directive "loginForm", ->
    restrict: "A"
    templateUrl: "templates/loginpage.html"
    scope:
        user: "="
        errors: "="