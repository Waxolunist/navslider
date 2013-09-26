'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    watch: {
      options: {
        nospawn: true
      },
      less: {
        files: ['app/styles/*.less'],
        tasks: ['less:server']
      },
      stylus: {
        files: ['app/styles/{,*/}*.styl'],
        tasks: ['stylus:compile']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          'app/*.html',
          'app/styles/{,*/}*.css',
          'app/styles/{,*/}*.less',
          'app/styles/{,*/}*.styl',
          'app/scripts/{,*/}*.js',
          'app/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'app'),
              lrSnippet
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },
    less: {
      server: {
        options: {
          paths: ['app/components/bootstrap/less', 'app/styles']
        },
        files: {
          'app/styles/main.css': 'app/styles/main.less'
        }
      }
    },
    stylus: {
      compile: {
        options: {
          urlfunc: 'embedurl' // use embedurl('test.png') in our code to trigger Data URI embedding
        },
        files: {
          'app/styles/main.css': 'app/styles/main.styl' // 1:1 compile
        }
      }
    },
    closureCompiler:  {

      options: {
        // [REQUIRED] Path to closure compiler
        compilerFile: '/Users/cst/Development/tools/closure-compiler/compiler.jar',

        // [OPTIONAL] set to true if you want to check if files were modified
        // before starting compilation (can save some time in large sourcebases)
        checkModified: true,

        // [OPTIONAL] Set Closure Compiler Directives here
        compilerOpts: {
          /**
           * Keys will be used as directives for the compiler
           * values can be strings or arrays.
           * If no value is required use null
           *
           * The directive 'externs' is treated as a special case
           * allowing a grunt file syntax (<config:...>, *)
           *
           * Following are some directive samples...
           */
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          //externs: ['path/to/file.js', '/source/**/*.js'],
          define: ['"goog.DEBUG=false"'],
          warning_level: 'verbose',
          jscomp_off: ['checkTypes', 'fileoverviewTags'],
          summary_detail_level: 3,
          output_wrapper: '"(function(){%output%}).call(this);"',
          transform_amd_modules: null
        },
        // [OPTIONAL] Set exec method options
        execOpts: {
          /**
           * Set maxBuffer if you got message "Error: maxBuffer exceeded."
           * Node default: 200*1024
           */
          maxBuffer: 999999 * 1024
        }

      },

      // any name that describes your task
      compile: {

        /**
         *[OPTIONAL] Here you can add new or override previous option of the Closure Compiler Directives.
         * IMPORTANT! The feature is enabled as a temporary solution to [#738](https://github.com/gruntjs/grunt/issues/738).
         * As soon as issue will be fixed this feature will be removed.
         */
        TEMPcompilerOpts: {
        },

        // [OPTIONAL] Target files to compile. Can be a string, an array of strings
        // or grunt file syntax (<config:...>, *)
        src: 'app/js/nav-slide/navSlider.js',

        // [OPTIONAL] set an output file
        dest: 'app/js/nav-slide/navSlider.min.js'
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: 'app/js/',
          mainConfigFile: 'app/js/main.js',
          out: 'app/js/main.min.js',
          name: 'main',
          done: function(done, output) {
            var duplicates = require('rjs-build-analysis').duplicates(output);

            if (duplicates.length > 0) {
              grunt.log.subhead('Duplicates found in requirejs build:');
              grunt.log.warn(duplicates);
              done(new Error('r.js built duplicate modules, please check the excludes option.'));
            }

            done();
          }
        }
      }
    }
  });

  grunt.registerTask('server', function (target) {

    grunt.task.run([
      'stylus:compile',
      'connect:livereload',
      'open',
      'watch',
    ]);
  });
};
