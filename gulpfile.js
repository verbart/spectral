const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const stylus = require('gulp-stylus');
const pug = require('gulp-pug');
const posthtml = require('gulp-posthtml');
const posthtmlBEM =  require('posthtml-bem');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const gulpIf = require('gulp-if');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const del = require('del');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');

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
    .pipe(posthtml([
      posthtmlBEM({
        elemPrefix: '__',
        modPrefix: '_',
        modDlmtr: '_'
      })
    ]))
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
    .pipe(stylus())
    .pipe(postcss([
      autoprefixer({
        browsers: ['> 5%', 'ff > 14']
      })
    ]))
    .pipe(gulpIf(isDevelopment, sourcemaps.write('./')))
    .pipe(gulpIf(!isDevelopment, cleanCSS()))
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
  gulp.watch('./{blocks,pages}/**/*.pug', gulp.series('views'));
  gulp.watch('./{blocks,pages}/**/*.styl', gulp.series('styles'));
});

gulp.task('serve', function () {
  browserSync.init({
    server: './public',
    port: 8080
  });

  browserSync.watch('./**/*.html').on('change', browserSync.reload);
  browserSync.watch('./**/*.css').on('change', browserSync.reload);
});

gulp.task('clean', function () {
  return del('./public')
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel(
    'images',
    'views',
    'styles'
)));

gulp.task('default', gulp.series(
  'build',
  gulp.parallel(
    'watch',
    'serve'
)));
