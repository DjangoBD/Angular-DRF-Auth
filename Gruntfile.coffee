'use strict'
# AngularJS Authentication and Autorization for Django REST Framework
# 
# Copyright 2016 (C) TEONITE - http://teonite.com

module.exports = (grunt)->

  # time grunt init
  require('time-grunt')(grunt)

  # load all grunt tasks
  (require 'matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  _ = grunt.util._
  path = require 'path'

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    coffeelint:
      gruntfile:
        src: '<%= watch.gruntfile.files %>'
      src:
        src: '<%= watch.src.files %>'
      options:
        no_trailing_whitespace:
          level: 'error'
        max_line_length:
          level: 'warn'
    coffee:
      src:
        expand: true
        cwd: 'src/'
        src: ['**/*.coffee']
        dest: 'compiled/'
        ext: '.js'
#    copy:
#      html:
#        expand: true
#        cwd: 'src'
#        src: ['**/*.js']
#        dest: 'dist/'
    watch:
      gruntfile:
        files: 'Gruntfile.coffee'
        tasks: ['coffeelint:gruntfile']
      src:
        files: ['src/**/*.coffee']
        tasks: ['coffeelint:src', 'coffee:src']
      html:
        files: ['src/**/*.html']
        tasks: ['copy']

    html2js:
          options:
              module: 'login.templates',
              htmlmin:
                  collapseWhitespace: true
                  removeComments: true
          main:
            src: [ '**/templates/*.html' ]
            dest: 'src/templates.js'

    concat:
        dist:
            files:
                'dist/angular-auth.js': [ 'compiled/**/*.js', 'src/templates.js']

    connect:
      server:
        options:
          base: 'example'
          port: 9999
          keepalive: true
          
    clean: ['dist/', 'compiled/']

  # tasks.
  grunt.registerTask 'compile', [
    'coffeelint'
    'coffee'
  ]

  grunt.registerTask 'build', [
    'clean',
    'coffee',
    'html2js',
    'concat'
  ]

  grunt.registerTask 'start', [
    'build',
    'connect'
  ]

  grunt.registerTask 'default', [
    'build'
  ]

