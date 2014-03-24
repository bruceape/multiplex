module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('grunt-aws.json'),
    bruce: {
        src: 'src',
        dist: 'build'
    },
    connect: {
      options: {
      port: 9001,
      livereload: 35729,
      hostname: '0.0.0.0'
    },
    server: {
        options: {
          base: '<%= bruce.src %>/'
        }
    },
    livereload: {
      options: {
        open: true,
        base: ['<%= bruce.src %>/']
      }
    }
  },

  // Watches files for changes and runs tasks based on the changed files
  watch: {
    js: {
      files: ['<%= bruce.src %>/scripts/{,*/}*.js'],
      tasks: ['jshint', 'concat:watch', 'uglify:watch'],
      options: {
        livereload: true
      }
    },
    gruntfile: {
      files: ['Gruntfile.js']
    },
    sass: {
      files: ['<%= bruce.src %>/styles/{,*/}*.{scss,sass}'],
      tasks: ['sass:watch', 'autoprefixer:watch'],
      options: {
          livereload: true
      }
    },
    livereload: {
      options: {
        livereload: '<%= connect.options.livereload %>'
      },
      files: ['<%= bruce.src %>/index.html', '<%= bruce.src %>/img/**', ],
      tasks: ['sass:watch', 'autoprefixer:watch', 'jshint', 'concat:watch', 'uglify:watch']
    }
  },

  jshint: {
      build: {
        src: ['Gruntfile.js', '<%= bruce.src %>/*.js']
      }
  },

  // Empties folders to start fresh
  clean: {
    dist: {
      files: [{
          dot: true,
          src: ['.tmp', '<%= bruce.dist %>/*', '!<%= bruce.dist %>/.git*']
        }]
      }
  },

  // Concantenate the JS from the src to the temp directory
  concat: {
    options: {
      separator: ';'
    },
    dist: {
      src: ['<%= bruce.src %>/scripts/*.js'],
      dest: '<%= bruce.dist %>/js/main.min.js'
    },
    watch: {
      src: ['<%= bruce.src %>/scripts/*.js'],
      dest: '<%= bruce.src %>/js/main.min.js'
    }
  },

  uglify: {
    dist: {
      options: {
        compress: {
          drop_console: true
        }
      },
      src: '<%= bruce.dist %>/js/main.min.js',
      dest: '<%= bruce.dist %>/js/main.min.js'
    },
    watch: {
      src: ['<%= bruce.src %>/js/*.js'],
      dest: '<%= bruce.src %>/js/main.min.js'
    }
  },

  // Build Sass files
  sass: {
    dist: {
      options: {
        style: 'compressed'
      },
      files: {
        '<%= bruce.dist %>/css/main.min.css': '<%= bruce.src %>/styles/main.scss'
      }
    },
    watch: {
      files: {
        '<%= bruce.src %>/css/main.min.css': '<%= bruce.src %>/styles/main.scss'
      }
    }
  },

  // Add vendor prefixed styles
  autoprefixer: {
    options: {
      browsers: ['last 2 version']
    },
    dist: {
      files: [{
        expand: true,
        cwd: '<%= bruce.dist %>/css/',
        src: '{,*/}*.css',
        dest: '<%= bruce.dist %>/css/'
      }]
    },
    watch: {
      files: [{
        expand: true,
        cwd: '<%= bruce.src %>/css/',
        src: '{,*/}*.css',
        dest: '<%= bruce.src %>/css/'
      }]
    }
  },

  cssmin: {
    options: {
      keepSpecialComments: '0'
    },
    combine: {
      files: {
        '<%= bruce.dist %>/css/main.min.css': '<%= bruce.dist %>/css/main.min.css'
      }
    }
  },

  // Minify Images
imagemin: {
    options: {
      cache: false
    },
    dist: {
      files: [{
        expand: true,
        cwd: '<%= bruce.src %>/img',
        src: '{,*/}*.{gif,jpeg,jpg,png}',
        dest: '<%= bruce.dist %>/img'
      }]
    }
  },

  svgmin: {
    dist: {
      files: [{
        expand: true,
        cwd: '<%= bruce.src %>/img',
        src: '{,*/}*.svg',
        dest: '<%= bruce.dist %>/img'
      }]
    }
  },

imageEmbed: {
    dist: {
      src: ['<%= bruce.dist %>/css/main.min.css'],
      dest: '<%= bruce.dist %>/css/main.min.css',
      options: {
        deleteAfterEncoding: false,
        maxImageSize: 0
      }
    }
  },

  copy: {
    dist: {
      files: [{
        expand: true,
        dot: true,
        cwd: '<%= bruce.src %>',
        dest: '<%= bruce.dist %>',
        src: [
          '*.{ico,png,txt}',
          '.htaccess',
          'img/{,*/}*.webp',
          '{,*/}*.html',
          'styles/fonts/{,*/}*.*',
          'bower_components/' + (this.includeCompass ? 'sass-' : '') + 'bootstrap/' + (this.includeCompass ? 'fonts/' : 'dist/fonts/') +'*.*'
        ]
      }]
    }
  },

  // Prefix for cache bustings
  rev: {
    dist: {
      files: {
        src: ['<%= bruce.dist %>/js/{,*/}*.js', '<%= bruce.dist %>/css/{,*/}*.css', '<%= bruce.dist %>/img/{,*/}*.{gif,jpeg,jpg,png,webp}', '<%= bruce.dist %>/styles/fonts/{,*/}*.*']
      }
    }
  },

  // Performs rewrites based on rev and the useminPrepare configuration
  usemin: {
    options: {
      assetsDirs: ['<%= bruce.dist %>', '<%= bruce.dist %>/img']
    },
    html: ['<%= bruce.dist %>/{,*/}*.html'],
    css: ['<%= bruce.dist %>/css/{,*/}*.css']
  },
  staticinline: {
    main: {
      files: {
        '<%= bruce.dist %>/index.html': '<%= bruce.dist %>/index.html',
      }
    }
  },

  htmlmin: {
    dist: {
      options: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeCommentsFromCDATA: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        useShortDoctype: true
      },
      files: [{
        expand: true,
        cwd: '<%= bruce.dist %>',
        src: '{,*/}*.html',
        dest: '<%= bruce.dist %>'
      }]
    }
  },

  s3: {
      options: {
        accessKeyId: '<%= aws.key %>',
        secretAccessKey: '<%= aws.secret %>',
        bucket: 'multiplex.bruceape.com',
        // cache: false
      },
      build: {
        cwd: '<%= bruce.dist %>/',
        src: '**'
      },
      longTym: {
        options: {
          headers: {
            CacheControl: 630720000, //max-age=630720000, public
            Expires: new Date(Date.now() + 63072000000).toUTCString()
          }
        },
        cwd: '<%= bruce.dist %>/',
        src: ['css/**', 'js/**', 'img/**']
      }
    }

  });

  grunt.loadNpmTasks("grunt-image-embed");
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-aws');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-rev');
  grunt.loadNpmTasks('grunt-static-inline');
  grunt.loadNpmTasks('grunt-svgmin');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('serve', [
    'sass:watch', 
    'autoprefixer:watch', 
    'jshint', 
    'concat:watch', 
    'uglify:watch',
    'connect:livereload', 
    'watch'
    ]);

  // Default task(s).
  grunt.registerTask('default', [
    'jshint', 
    'clean', 
    'concat:dist', 
    'sass:dist',
    'autoprefixer:dist', 
    'cssmin', 
    'uglify:dist',
    'imagemin:dist',
    'copy:dist',
    'svgmin',
    'rev', 
    'usemin',
    'staticinline:main',
    'htmlmin'
  ]);

  grunt.registerTask('deploy', ['s3']);
};
