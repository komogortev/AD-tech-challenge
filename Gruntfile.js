module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: ';'
      },
      js: {
        src: ['assets/js/store.js', 'assets/js/core.js', 'assets/js/filter.js', 'assets/js/**/*.js'],
        dest: 'public/javascripts/<%= pkg.name %>.js'
      },
      marine_css: {
        src: ['assets/scss/theme-marine/*.scss'],
        dest: 'assets/scss/theme-marine/theme-marine.css'
      },
      burnt_css: {
        src: ['assets/scss/theme-burnt/*.scss'],
        dest: 'assets/scss/theme-burnt/theme-burnt.css'
      }
    },


    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        module: "es2015",
        target: "es5"
      },
      dist: {
        files: {
          'public/javascripts/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
        }
      }
    },

    qunit: {
      files: ['qunit/**/*.html']
    },

    jshint: {
      files: ['Gruntfile.js', 'assets/js/**/*.js','qunit/**/*.js'],

      options: {
        globals: {
          "jQuery": true,
          "console": true,
          "module": true,
          "Core": true,
          "Store": true
        },
        'esversion': 6,
        '-W014': true,
        '-W120': true,
      }

    },

    sass: {
      options: {
        sourceMap: true,
        style: 'compressed',
        precision: 5
      },
      dist: {
        files: {
         'public/stylesheets/main.css' : 'assets/scss/main.scss',
         'public/stylesheets/theme-marine.css' : '<%= concat.marine_css.dest %>',
         'public/stylesheets/theme-burnt.css' : '<%= concat.burnt_css.dest %>',
        }
      }
    },


    scsslint: {
      options: {
        config: 'config/.scss-lint.yml',
        emitError: true,
        force: true,
        reporterOutput: 'scss-lint-report.xml'
      },
      allFiles: [
        'assets/scss/**/*.scss',
      ]
    },

    postcss: {
      options: {
        map: false,
        processors: [
          require('autoprefixer')({browsers: 'last 2 versions'}), // add vendor prefixes
          require('cssnano')()
        ]
      },
      dist: {
        src: 'public/stylesheets/**/*.css'
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-scss-lint');
  grunt.loadNpmTasks('grunt-postcss');

  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('watch', ['jshint', 'qunit', 'sass']);
  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify', 'scsslint', 'sass', 'postcss']);

};