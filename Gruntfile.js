module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      options: {
        banner: '#!/usr/bin/env node\n'
      },
      dist: {
        src: ['lib/makemeasandwich.js'],
        dest: 'bin/makemeasandwich',
      },
    },
    chmod: {
      options: {
        mode: '755'
      },
      yourTarget1: {
        src: ['bin/makemeasandwich']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-chmod');
  grunt.registerTask('default', ['concat','chmod']);

};