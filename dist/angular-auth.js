(function() {
  var app,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
      return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
  }

  app = angular.module("angularAuth", []);

  app.run([
    '$rootScope', '$http', 'CookieService', 'AuthService', '$location', '$urlRouter', '$state', '$urlMatcherFactory', 'Config', function($rootScope, $http, CookieService, AuthService, $location, $urlRouter, $state, $urlMatcherFactory, Config) {
      var setTargetUrl;
      $http.defaults.headers.common["X-CSRFToken"] = CookieService.get('csrftoken');
      setTargetUrl = function() {
        if (CookieService.get('nextUrl')) {
          if (__indexOf.call(CookieService.get('nextUrl'), '#') >= 0) {
            window.location = CookieService.get('nextUrl');
          } else {
            $location.path(CookieService.get('nextUrl'));
          }
          CookieService.remove('nextUrl');
        }
      };
      return $rootScope.$on("$stateChangeStart", function(event, next, nextParams) {
        var authorizeUser, authorizedRoles, href, restrictedRoles, urlMatcher;
        authorizeUser = function(authorizedRoles, restrictedRoles, event, next) {
          if ((authorizedRoles && !AuthService.isAuthorized(authorizedRoles, $rootScope.session)) || (restrictedRoles && AuthService.isRestricted(restrictedRoles, $rootScope.session))) {
            $rootScope.$broadcast("userNotAuthorized");
            return false;
          } else {
            if ($rootScope.session) {
              $rootScope.user = $rootScope.session.user;
            }
            $rootScope.$broadcast("userAccessGranted");
            return true;
          }
        };
        if (next.data && next.data.unrestricted) {
          if (!next.name.endsWith('login')) {
            setTargetUrl();
          }
          return true;
        }
        if (CookieService.get('token')) {
          $http.defaults.headers.common["Authorization"] = "Token " + CookieService.get('token');
        } else {
          if (!next.name.endsWith('login')) {
            urlMatcher = $urlMatcherFactory.compile(next.url, nextParams);
            href = $urlRouter.href(urlMatcher, nextParams);
            CookieService.put('nextUrl', href);
            event.preventDefault();
          }
          delete $http.defaults.headers.common["Authorization"];
          CookieService.remove('sessionid');
          if (Config.loginUrl) {
            window.location = Config.loginUrl;
          } else {
            window.location = "/login";
          }
          return;
        }
        if (next.data) {
          authorizedRoles = next.data.authorizedRoles;
          restrictedRoles = next.data.restrictedRoles;
        }
        if ($rootScope.user) {
          if (authorizeUser(authorizedRoles, restrictedRoles, event, next)) {
            setTargetUrl();
            return true;
          }
        }
        return AuthService.checkAuth().then((function(result) {
          $rootScope.user = result;
          $rootScope.session = AuthService.createSessionFor(result);
          if (!next.name.endsWith('login')) {
            setTargetUrl();
          }
          return authorizeUser(authorizedRoles, restrictedRoles, event, next);
        }), function(errors) {
          CookieService.remove('token');
          CookieService.remove('nextUrl');
          delete $http.defaults.headers.common["Authorization"];
          if (Config.loginUrl) {
            return window.location = Config.loginUrl;
          } else {
            return window.location = "/login";
          }
        });
      });
    }
  ]);

}).call(this);

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module("angularAuth").factory("AuthService", [
    'Config', 'HttpService', function(Config, HttpService) {
      return {
        login: function(user) {
          var url;
          url = Config.apiRoot + "/api-token-auth/";
          return HttpService.post(url, user);
        },
        checkAuth: function() {
          var url;
          url = Config.apiRoot + "/check-auth/";
          return HttpService.get(url);
        },
        createSessionFor: function(user) {
          var group, ind;
          return {
            user: user,
            userRoles: [
              (function() {
                var _ref, _results;
                _ref = user.groups;
                _results = [];
                for (ind in _ref) {
                  group = _ref[ind];
                  _results.push(group.name);
                }
                return _results;
              })()
            ][0]
          };
        },
        isAuthorized: function(authorizedRoles, session) {
          var role, _i, _len;
          if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
          }
          if (authorizedRoles.length === 0) {
            return true;
          }
          for (_i = 0, _len = authorizedRoles.length; _i < _len; _i++) {
            role = authorizedRoles[_i];
            if (__indexOf.call(session.userRoles, role) >= 0) {
              return true;
            }
          }
          return false;
        },
        isRestricted: function(restrictedRoles, session) {
          var role, _i, _len, _ref;
          if (!angular.isArray(restrictedRoles)) {
            restrictedRoles = [restrictedRoles];
          }
          if (restrictedRoles.length === 0) {
            return false;
          }
          _ref = session.userRoles;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            role = _ref[_i];
            if (__indexOf.call(restrictedRoles, role) >= 0) {
              return true;
            }
          }
          return false;
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module("angularAuth").factory("CookieService", [
    '$cookies', function($cookies) {
      return {
        get: function(name) {
          if ($cookies.get) {
            return $cookies.get(name);
          } else {
            return $cookies[name];
          }
        },
        put: function(name, value) {
          if ($cookies.put) {
            return $cookies.put(name, value);
          } else {
            return $cookies[name] = value;
          }
        },
        remove: function(name) {
          if ($cookies.remove) {
            return $cookies.remove(name);
          } else {
            return delete $cookies[name];
          }
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module("angularAuth").directive('hasPermission', [
    '$rootScope', function($rootScope) {
      return {
        scope: {
          user: '='
        },
        link: function(scope, element, attrs) {
          var group, hasPermission, notPermissionFlag, permission, value, _i, _j, _len, _len1, _ref, _ref1;
          value = attrs.hasPermission.trim();
          notPermissionFlag = value[0] === '!';
          if (notPermissionFlag) {
            value = value.slice(1).trim();
          }
          hasPermission = false;
          if (scope.user) {
            _ref = scope.user.groups;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              group = _ref[_i];
              _ref1 = group.permissions;
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                permission = _ref1[_j];
                if (permission.codename === value) {
                  hasPermission = true;
                }
              }
            }
          }
          if (hasPermission && !notPermissionFlag || !hasPermission && notPermissionFlag) {
            return element.show();
          } else {
            return element.hide();
          }
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module("angularAuth").directive('hasPermissionToObject', [
    '$rootScope', function($rootScope) {
      return {
        scope: {
          object: '=',
          user: '=',
          disable: '='
        },
        link: function(scope, element, attrs) {
          var group, hasPermission, notPermissionFlag, object, permission, value, visibility, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
          value = attrs.hasPermissionToObject.trim();
          notPermissionFlag = value[0] === '!';
          if (notPermissionFlag) {
            value = value.slice(1).trim();
          }
          object = scope.object;
          hasPermission = false;
          if (object && !object.visibility) {
            hasPermission = true;
          } else {
            if (scope.user) {
              _ref = scope.user.groups;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                group = _ref[_i];
                _ref1 = group.permissions;
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  permission = _ref1[_j];
                  if (permission.codename === value) {
                    if (!object) {
                      hasPermission = true;
                    } else {
                      _ref2 = object.visibility;
                      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                        visibility = _ref2[_k];
                        if (visibility.permission === permission.id) {
                          hasPermission = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (hasPermission && !notPermissionFlag || !hasPermission && notPermissionFlag) {
            if (scope.disable) {
              element.removeAttr('disabled');
              element.trigger('chosen:updated');
            }
            return element.show();
          } else {
            if (scope.disable) {
              attrs.$set('disabled', 'disabled');
              return element.trigger('chosen:updated');
            } else {
              return element.hide();
            }
          }
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module("angularAuth").factory("HttpService", [
    "$http", "$q", "$timeout", function($http, $q, $timeout) {
      var ensureEndsWithSlash;
      ensureEndsWithSlash = function(url) {
        if (url[url.length - 1] === "/") {
          return url;
        } else {
          return url + "/";
        }
      };
      return {
        get: function(url, timeout) {
          var defer;
          defer = $q.defer();
          $http({
            method: "GET",
            url: url
          }).success(function(data) {
            if (timeout) {
              $timeout((function() {
                defer.resolve(data);
              }), timeout);
            } else {
              defer.resolve(data);
            }
          }).error(function(data) {
            console.error("HttpService.get error: " + data);
            defer.reject(data);
          });
          return defer.promise;
        },
        getblob: function(url) {
          var defer;
          defer = $q.defer();
          $http({
            method: "GET",
            url: url,
            responseType: "blob"
          }).success(function(data) {
            defer.resolve(data);
          }).error(function(data) {
            console.error("HttpService.get error: " + data);
            defer.reject(data);
          });
          return defer.promise;
        },
        post: function(url, data) {
          var defer, surl;
          defer = $q.defer();
          surl = ensureEndsWithSlash(url);
          $http({
            method: "POST",
            url: surl,
            data: data
          }).success(function(data) {
            defer.resolve(data);
          }).error(function(data) {
            console.error("HttpService.post error: " + data);
            defer.reject(data);
          });
          return defer.promise;
        },
        put: function(url, data) {
          var defer, surl;
          defer = $q.defer();
          surl = ensureEndsWithSlash(url);
          $http({
            method: "PUT",
            url: surl,
            data: data
          }).success(function(data) {
            defer.resolve(data);
          }).error(function(data) {
            console.error("HttpService.put error: " + data);
            defer.reject(data);
          });
          return defer.promise;
        },
        "delete": function(url, data) {
          var defer, surl;
          defer = $q.defer();
          surl = ensureEndsWithSlash(url);
          $http({
            method: "DELETE",
            url: surl,
            data: data
          }).success(function(data) {
            defer.resolve(data);
          }).error(function(data) {
            console.error("HttpService.put error: " + data);
            defer.reject(data);
          });
          return defer.promise;
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module("angularAuth").controller("ExampleLoginCtrl", [
    '$scope', '$rootScope', '$state', 'Config', 'AuthService', 'CookieService', '$http', '$timeout', function($scope, $rootScope, $state, Config, AuthService, CookieService, $http, $timeout) {
      $scope.state = $state;
      $scope.Config = Config;
      $scope.user = {
        username: "",
        password: ""
      };
      $scope.login = function() {
        return AuthService.login($scope.user).then((function(result) {
          CookieService.put('token', result["token"]);
          $http.defaults.headers.common["Authorization"] = "Token " + result["token"];
          return AuthService.checkAuth().then(function(user) {
            $rootScope.user = user;
            $rootScope.session = AuthService.createSessionFor(user);
            return $rootScope.$broadcast("loginSuccess");
          });
        }), function(errors) {
          $scope.errors = errors;
          delete $rootScope.user;
          delete $rootScope.session;
          return $rootScope.$broadcast("loginFailed");
        });
      };
      return $scope.logout = function() {
        CookieService.remove('token');
        CookieService.remove('sessionid');
        delete $rootScope.session;
        return $state.go("login");
      };
    }
  ]);

}).call(this);

(function() {
  angular.module("angularAuth").directive("loginForm", function() {
    return {
      restrict: "A",
      templateUrl: "templates/loginpage.html",
      scope: {
        user: "=",
        errors: "="
      }
    };
  });

}).call(this);

angular.module('login.templates', ['templates/loginpage.html']);

angular.module("templates/loginpage.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/loginpage.html",
    "<form ng-controller=\"ExampleLoginCtrl\" ng-submit=\"login()\"><table class=\"input-line\"><tr><td><p>Login:</p></td><td><p>Password:</p></td></tr><tr><td><div class=\"list-input\"><div class=\"input-group\"><input ng-model=\"user.username\" name=\"username\" id=\"username\" type=\"text\" tabindex=\"1\" class=\"form-control\"></div><div ng-repeat=\"error in errors.username\" class=\"danger-text\">{{error}}</div></div></td><td><div class=\"list-input\"><div class=\"input-group\"><input ng-model=\"user.password\" name=\"password\" id=\"password\" type=\"password\" tabindex=\"2\" class=\"form-control\"></div><div ng-repeat=\"error in errors.password\" class=\"danger-text\">{{error}}</div></div></td></tr><tr><td colspan=\"2\"><div ng-repeat=\"error in errors.non_field_errors\" class=\"danger-text\">{{error}}</div></td></tr></table><div class=\"button\"><button type=\"submit\" class=\"btn btn-primary\">Login <span class=\"glyphicon glyphicon-lock\"></span></button></div></form>");
}]);
