/*
 * grunt-lingxi-base64
 * https://github.com/xwliu/grunt-lingxi-base64
 *
 * Copyright (c) 2017 adtxgc
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    copy: {
      img: {
        expand: true,
        cwd: 'test/Test/images/',
        src: '**',
        dest: 'test/Target/images/'
      },
      css: {
        expand: true,
        cwd: 'test/Test/css/',
        src: '**',
        dest: 'test/Target/css/'
      },
      js: {
        expand: true,
        cwd: 'test/Test/js/',
        src: '**',
        dest: 'test/Target/js/'
      },
      html: {
        expand: true,
        cwd: 'test/Test/',
        src: ['*html'],
        dest: 'test/Target/'
      },
    },

    // Configuration to be run (and then tested).
    lingxi_base64: {
      options: {
        limit: 5120,
        imgAllowMd5: true
      },
      files: {
        src: ['test/Target/*html', 'test/Target/css/*.css',
          'test/Target/js/*.js'
        ]
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('default', ['copy', 'lingxi_base64']);

};
