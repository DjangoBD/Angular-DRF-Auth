# AngularJS Authentication and Autorization for Django REST Framework
# 
# Copyright 2016 (C) TEONITE - http://teonite.com

angular.module("angularAuth").factory "AuthService", ['Config', 'HttpService', (Config, HttpService) ->
    login: (user) ->
        url = Config.apiRoot + "/api-token-auth/"
        HttpService.post url, user

    checkAuth: ->
        url = Config.apiRoot + "/check-auth/"
        HttpService.get(url)

    createSessionFor: (user) ->
        user: user
        userRoles: [group.name for ind, group of user.groups][0]

    isAuthorized: (authorizedRoles, session) ->
        if not angular.isArray authorizedRoles
            authorizedRoles = [authorizedRoles]
        if authorizedRoles.length == 0
            return true
        for role in authorizedRoles
            if role in session.userRoles
                return true
        return false

    isRestricted: (restrictedRoles, session) ->
        if not angular.isArray restrictedRoles
            restrictedRoles = [restrictedRoles]
        if restrictedRoles.length == 0
            return false
        for role in session.userRoles
            if role in restrictedRoles
                return true
        return false
]