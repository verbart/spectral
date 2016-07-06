const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const stylus = require('gulp-stylus');
const pug = require('gulp-pug');
const resolver = require('stylus').resolver;
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const gulpIf = require('gulp-if');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const debug = require('gulp-debug');
const del = require('del');

const isDevelopment = process.env.NODE_ENV !== 'production';


gulp.task('views', function () {
  return gulp.src('pages/**/*.pug')
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          message: err.message
        };
      })
    }))
    .pipe(pug({
      pretty: isDevelopment
    }))
    .pipe(gulp.dest('./public'));
});

gulp.task('styles', function () {
  return gulp.src('./pages/**/*.styl')
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          message: err.message
        };
      })
    }))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
      .pipe(stylus({
        'include-css': true,
        define: {
          url: resolver()
        }
      }))
    .pipe(gulpIf(isDevelopment, sourcemaps.write('./')))
    .pipe(gulp.dest('./public'));
});

gulp.task('images', function () {
  return gulp.src('./blocks/**/*.{png,jpg,gif,svg}')
    .pipe(rename(function (path) {
      path.dirname = '';
    }))
    .pipe(gulp.dest('./public/images'));
});

gulp.task('watch', function () {
  gulp.watch('./{blocks,pages}/**/*.pug', ['views']);
  gulp.watch('./{blocks,pages}/**/*.styl', ['styles']);
});

gulp.task('serve', function () {
  browserSync.init({
    server: './public',
    port: 8080
  });

  browserSync.watch('./public/**/*.html').on('change', browserSync.reload);
  browserSync.watch('./public/**/*.css').on('change', browserSync.reload);
});

gulp.task('clean', function () {
  del('./public')
});

gulp.task('build', [
  'clean',
  'images',
  'views',
  'styles'
]);

gulp.task('default', [
  'build',
  'watch',
  'serve'
]);
