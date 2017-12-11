const
    babel           = require('gulp-babel'),
    babelify        = require('babelify'),
    browserify      = require('browserify'),
    browserSync     = require('browser-sync').create(),
    buffer          = require('vinyl-buffer'),
    gulp            = require('gulp'),
    gulpIf          = require('gulp-if'),
    gutil           = require('gulp-util'),
    gulpRename      = require('gulp-rename'),
    gulpUglify      = require('gulp-uglify'),
    gulpStripDebug  = require('gulp-strip-debug'),
    path            = require('path'),
    source          = require('vinyl-source-stream'),
    sourcemaps      = require('gulp-sourcemaps'),
    polyfiller = require('gulp-polyfiller'),
    
    { paths, pkgname }       = require('../config'),
    { ENV_DEV } = require('../envs')


gulp.task('libs-scripts', () => {
    // Not using buffer and source stream, because don't need
    return gulp.src(paths.libs.src)
    .pipe(babel())
    .pipe(gulpUglify())
    .pipe(gulp.dest(paths.libs.dst))
})

gulp.task('source-scripts', () => {
    return browserify({
        entries: path.join(paths.js.entry),
        debug:   true
    })
    .transform(babelify, {
        presets: ['es2015'],
        plugins: ['transform-runtime', 'transform-async-to-generator']
    })
    .bundle()
    .pipe(source(`${pkgname}.js`))
    .pipe(polyfiller(['Fetch','Promise']))
    .pipe(buffer())
    .pipe(gulpIf(ENV_DEV, sourcemaps.init({ loadMaps: true})))
    .pipe(gulpUglify().on('error', gutil.log))
    .pipe(gulpIf(!ENV_DEV, gulpStripDebug()))
    .pipe(gulpIf(!ENV_DEV, gulpRename((path) => {
          path.extname = `.min` + path.extname;
        })))
    .pipe(gulpIf(ENV_DEV, sourcemaps.write('.')))
    .pipe(gulp.dest(paths.js.dst))
    .pipe(gulpIf(ENV_DEV, browserSync.reload({ stream: true })))
})

module.exports = gulp.task('scripts', ['libs-scripts', 'source-scripts'])
