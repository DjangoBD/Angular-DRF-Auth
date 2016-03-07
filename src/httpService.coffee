# AngularJS Authentication and Autorization for Django REST Framework
# 
# Copyright 2016 (C) TEONITE - http://teonite.com

angular.module("angularAuth").factory "HttpService", [
  "$http"
  "$q"
  "$timeout"
  ($http, $q, $timeout) ->
    ensureEndsWithSlash = (url) ->
      (if url[url.length - 1] is "/" then url else url + "/")
    return (
      get: (url, timeout) ->
        defer = $q.defer()
        $http(
          method: "GET"
          url: url
        ).success((data) ->
          if timeout
            $timeout (->
              defer.resolve data
              return
            ), timeout
          else
            defer.resolve data
          return
        ).error (data) ->
          console.error "HttpService.get error: " + data
          defer.reject data
          return

        defer.promise

      getblob: (url) ->
        defer = $q.defer()
        $http(
          method: "GET"
          url: url
          responseType: "blob"
        ).success((data) ->
          defer.resolve data
          return
        ).error (data) ->
          console.error "HttpService.get error: " + data
          defer.reject data
          return

        defer.promise

      post: (url, data) ->
        defer = $q.defer()
        surl = ensureEndsWithSlash(url)
        $http(
          method: "POST"
          url: surl
          data: data
        ).success((data) ->
          defer.resolve data
          return
        ).error (data) ->
          console.error "HttpService.post error: " + data
          defer.reject data
          return

        defer.promise

      put: (url, data) ->
        defer = $q.defer()
        surl = ensureEndsWithSlash(url)
        $http(
          method: "PUT"
          url: surl
          data: data
        ).success((data) ->
          defer.resolve data
          return
        ).error (data) ->
          console.error "HttpService.put error: " + data
          defer.reject data
          return

        defer.promise

      delete: (url, data) ->
        defer = $q.defer()
        surl = ensureEndsWithSlash(url)
        $http(
          method: "DELETE"
          url: surl
          data: data
        ).success((data) ->
          defer.resolve data
          return
        ).error (data) ->
          console.error "HttpService.put error: " + data
          defer.reject data
          return

        defer.promise
    )
]
