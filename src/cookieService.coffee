# AngularJS Authentication and Autorization for Django REST Framework
# 
# Copyright 2016 (C) TEONITE - http://teonite.com

angular.module("angularAuth").factory "CookieService", ['$cookies', ($cookies) ->
    get: (name) ->
      if $cookies.get
        return $cookies.get(name)
      else
        return $cookies[name]

    put: (name, value) ->
      if $cookies.put
        return $cookies.put(name, value)
      else
        return $cookies[name] = value

    remove: (name) ->
      if $cookies.remove
        return $cookies.remove(name)
      else
        delete $cookies[name]
]
