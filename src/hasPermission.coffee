# AngularJS Authentication and Autorization for Django REST Framework
# 
# Copyright 2016 (C) TEONITE - http://teonite.com

angular.module("angularAuth").directive('hasPermission', ['$rootScope', ($rootScope) ->
    scope:
        user: '='
    link: (scope, element, attrs) ->
        value = attrs.hasPermission.trim()
        notPermissionFlag = value[0] == '!'
        if notPermissionFlag
            value = value.slice(1).trim()

        hasPermission = false;
        if scope.user
            for group in scope.user.groups
                for permission in group.permissions
                    if permission.codename == value
                        hasPermission = true
        if (hasPermission && !notPermissionFlag || !hasPermission && notPermissionFlag)
            element.show()
        else
            element.hide()
])