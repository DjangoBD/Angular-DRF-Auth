# AngularJS Authentication and Autorization for Django REST Framework
# 
# Copyright 2016 (C) TEONITE - http://teonite.com

angular.module("angularAuth").directive('hasPermissionToObject', ['$rootScope', ($rootScope) ->
    scope:
        object: '='
        user: '='
        disable: '='
    link: (scope, element, attrs) ->
        value = attrs.hasPermissionToObject.trim()
        notPermissionFlag = value[0] == '!'
        if notPermissionFlag
            value = value.slice(1).trim()
        object = scope.object
        hasPermission = false
        if object && !object.visibility
            hasPermission = true
        else
            if scope.user
                for group in scope.user.groups
                    for permission in group.permissions
                        if permission.codename == value
                            if !object
                                hasPermission = true
                            else
                                for visibility in object.visibility
                                    if visibility.permission == permission.id
                                        hasPermission = true


        if hasPermission && !notPermissionFlag || !hasPermission && notPermissionFlag
            if scope.disable
                element.removeAttr('disabled')
                element.trigger('chosen:updated')
            element.show()
        else
            if scope.disable
                attrs.$set('disabled', 'disabled')
                element.trigger('chosen:updated')
            else
                element.hide()
])