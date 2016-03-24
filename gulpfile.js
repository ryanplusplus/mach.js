var gulp = require('gulp');
var jshint = require('gulp-jshint');
var _jasmine = require('gulp-jasmine');
var istanbul = require('gulp-istanbul');
var watch = require('gulp-watch');
var tap = require('gulp-tap');

var source = ['./src/**/*.js', './index.js'];
var lib = ['./lib/**/*.js'];
var tests = ['./spec/**/*.js'];
var gulpfile = ['./gulpfile.js'];
var all = [].concat(source).concat(tests).concat(lib).concat(gulpfile);

var jasmineConfig = {
   'spec_dir': 'spec',
   'spec_files': ['**/*[sS]pec.js']
};

gulp.task('test', function() {
   return gulp.src([].concat(tests))
      .pipe(_jasmine({
         config: jasmineConfig,
         includeStackTrace: true
      }));
});

gulp.task('lint', function() {
   return gulp.src([].concat(source).concat(tests).concat(lib).concat(gulpfile))
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
});

gulp.task('coverage', function() {
   return gulp.src([].concat(source))
      .pipe(istanbul())
      .pipe(istanbul.hookRequire())
      .pipe(tap(function(f) {
         require(f.path);
      }))
      .on('end', function() {
         gulp.src([].concat(tests))
            .pipe(_jasmine({
               config: jasmineConfig
            }))
            .pipe(istanbul.writeReports({
               dir: './coverage',
               reporters: ['text', 'text-summary', 'lcov'],
            }));
      });
});

gulp.task('watch', function() {
   gulp.start(['lint'], ['test']);

   watch(all, function() {
      gulp.start(['lint'], ['test']);
   });
});
