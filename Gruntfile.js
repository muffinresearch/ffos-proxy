module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: true,
      },
      all: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js', 'bin/proxify'],
    },
    mochaTest: {
      options: {
        require: [
          function(){
            /* jshint -W020 */
            assert = require('chai').assert;
          },
        ],
        reporter: 'spec',
      },
      all: ['tests/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('test', ['jshint', 'mochaTest']);
};
