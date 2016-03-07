angular.module("angularAuth").directive "loginForm", ->
    restrict: "A"
    templateUrl: "templates/loginpage.html"
    scope:
        user: "="
        errors: "="