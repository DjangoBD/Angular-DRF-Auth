# Angular authentication (and authorization) based on Django REST Framework tokens, written in Coffee Script

#### TL;DR
Authenticate AngularJS app with Django (REST framework) backend using Token Based Authentication.

# Table of Contents

* [About this module](#about-this-module)
* [How it works] (#how-it-works)
* [Installation](#installation)
* [Basic Usage] (#basic-usage)


# About this module

At the time there was no module like this available - so we've created one. 
We love simplicity! We've put much effort in making this module as slim and easy to use as possible.
Angular-DRF-Auth is based on Token Authentication in Django REST Framework with the following features:

* simple front-end template with a log-in form
* redirection to the log-in form if unlogged user tries to enter an application
* authorisation rights based on assigned roles
* defining if particular webpage should require authentication (or authorization)
* Angular UI-Router support
* hide/display selected elements using ```hasPermission``` and ```hasPermissionToObject``` directives depending on granted permissions

# How it works

1) A user wants to enter restricted page.

2) Angular-DRF-Auth checks if there is cookie 'token' for that site, if not it redirects to ```/#/login``` at this site. 
```/#/login``` url is configured to be managed by ```LoginCtrl``` which is a part of AngularAuth library.

3) ```LoginCtrl``` posts user and password to backend's url - ```/api-token-auth``` that is managed by Django REST Framework. 
If username and password are correct, api-token-auth returns the token in the response.

4) Token is stored as a cookie and common authentication http header is set to Token and the token value.

5) Next there is another backend call to ```/check-auth``` which is any url managed by Django REST Framework which returns user in the response.

6) The user is set to angular ```$rootScope``` to session object. 
If the token cookie exists, angular auth calls ```/check-auth``` to get the user and set it to the scope, it happens always when the page is refreshed.

7) Angular auth provides the directive has-permission-to-object which can be used to show/hide page elements based on permissions of the user groups.
# Installation

* Download this module and its dependencies: 

```shell
# from the terminal at the root of your project
bower install angular-drf-auth --save
```
  
# Basic Usage

```html
<div has-permission-to-object="write_project" user="user" object="project"/>
```
User is an object which is returned by ```/check-auth``` url, project is an example name which can be anything you want to check user access on it - It has to have 'visibility' property which is the table of the object with permission property:

```javascript
project.visibility = [{permission: 1}, {permission: 2}]
```

That means that user has to have at least one of the group permission with ```id=1``` or ```id=2``` to have an access to the project object.
```Has-permission-to-object``` directive deals also well with the angular-chosen select components and is able to enable/disable them. The directive can also 'negate' the permission check, it can be done with '!' sign, f.e.

```html
<div has-permission-to-object="!write_project" user="user" object="project"/>
```

That means that this div will be displayed only for users that don't have write_project group permission.

#### Webapp configuration using angular ui router

```javasrcipt
.config(function ($stateProvider, $urlRouterProvider) {
    // redirect to project list on /
    $urlRouterProvider.when('', '/check');

    // define states
    $stateProvider
        .state('check', {
            url: '/check',
        })
        .state('login', {
            url: '/login',
            templateUrl: 'common/templates/login.html',
            controller: 'LoginCtrl',
            resolve: {
            }
        })
}
```

also in your application you have to add service with url to your api: 

```javascript
.factory(
  'Config', function() { 
    return {
      apiUrl: 'http://localhost:8080/api'
      };
    });
```

#### Backend configuration that uses Django REST Framework

```python
url(r'^api-token-auth/', 'rest_framework.authtoken.views.obtain_auth_token'),
url(r'^check-auth/', CheckAuthView.as_view()),

class CheckAuthView(generics.views.APIView):
    def get(self, request, *args, **kwargs):
        return Response(UserWithFullGroupsSerializer(request.user).data)
```
