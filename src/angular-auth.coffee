# AngularJS Authentication and Autorization for Django REST Framework
# 
# Copyright 2016 (C) TEONITE - http://teonite.com

if typeof String::endsWith != 'function'

  String::endsWith = (suffix) ->
    @indexOf(suffix, @length - (suffix.length)) != -1

app = angular.module("angularAuth", [])

app.run ['$rootScope', '$http', 'CookieService', 'AuthService', '$location', '$urlRouter', '$state', '$urlMatcherFactory', 'Config', ($rootScope, $http, CookieService, AuthService, $location, $urlRouter, $state, $urlMatcherFactory, Config) ->
    
    #app config
    # always send CSRF token with requests
    $http.defaults.headers.common["X-CSRFToken"] = CookieService.get('csrftoken')

    setTargetUrl = () ->
        if CookieService.get('nextUrl')
            if '#' in CookieService.get('nextUrl')
                window.location = CookieService.get('nextUrl')
            else
                $location.path(CookieService.get('nextUrl'))
            CookieService.remove('nextUrl')
            return

    $rootScope.$on "$stateChangeStart", (event, next, nextParams) ->

        authorizeUser = (authorizedRoles, restrictedRoles, event, next) ->
            if (authorizedRoles && !AuthService.isAuthorized(authorizedRoles, $rootScope.session)) || (restrictedRoles && AuthService.isRestricted(restrictedRoles, $rootScope.session))
                $rootScope.$broadcast "userNotAuthorized"
                return false
            else
                if $rootScope.session
                    $rootScope.user = $rootScope.session.user
                $rootScope.$broadcast "userAccessGranted"
                return true

        # pass requests to unrestricted urls
        if next.data && next.data.unrestricted
          if not next.name.endsWith 'login'
            setTargetUrl()
          return true

        # if cookie token exists set it in request header
        if CookieService.get('token')
            $http.defaults.headers.common["Authorization"] = "Token " + CookieService.get('token')
        else
            # there is no cookie. store destination url and redirect to login page
            if not next.name.endsWith 'login'
                urlMatcher = $urlMatcherFactory.compile(next.url, nextParams)
                href = $urlRouter.href(urlMatcher, nextParams)
                CookieService.put('nextUrl', href)
                event.preventDefault()
            delete $http.defaults.headers.common["Authorization"]
            # delete django sessionid cookie to prevent strange behaviour
            CookieService.remove('sessionid')
            if Config.loginUrl
                window.location = Config.loginUrl
            else
                window.location = "/login"
            return

        # at this point we have a token cookie, but it can be valid or not

        if next.data
            authorizedRoles = next.data.authorizedRoles
            restrictedRoles = next.data.restrictedRoles

        if $rootScope.user
            # if there is a user in $rootScope that means it was set by LoginCtrl after successful login.
            if authorizeUser(authorizedRoles, restrictedRoles, event, next)
                setTargetUrl()
                return true

        # let's check if token is still valid
        AuthService.checkAuth().then ((result) ->
            $rootScope.user = result
            $rootScope.session = AuthService.createSessionFor result
            if not next.name.endsWith 'login'
                setTargetUrl()
            authorizeUser(authorizedRoles, restrictedRoles, event, next)

        ), (errors) ->
            CookieService.remove('token')
            CookieService.remove('nextUrl')
            delete $http.defaults.headers.common["Authorization"]
            if Config.loginUrl
                window.location = Config.loginUrl
            else
                window.location = "/login"
]



