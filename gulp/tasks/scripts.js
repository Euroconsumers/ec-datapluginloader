const
    babel           = require('gulp-babel'),
    babelify        = require('babelify'),
    browserify      = require('browserify'),
    browserSync     = require('browser-sync').create(),
    buffer          = require('vinyl-buffer'),
    eslint          = require('gulp-eslint'),
    gulp            = require('gulp'),
    gulpIf          = require('gulp-if'),
    gutil           = require('gulp-util'),
    gulpRename      = require('gulp-rename'),
    gulpUglify      = require('gulp-uglify'),
    gulpStripDebug  = require('gulp-strip-debug'),
    jsdoc           = require('gulp-jsdoc3'),
    path            = require('path'),
    polyfiller      = require('gulp-polyfiller'),
    source          = require('vinyl-source-stream'),
    sourcemaps      = require('gulp-sourcemaps'),
    
    { paths, pkgname }       = require('../config'),
    { ENV_DEV } = require('../envs');

gulp.task('source-scripts', () => {
    return browserify({
        entries: path.join(paths.js.entry),
        debug:   true
    })
    .transform(babelify)
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

gulp.task('jsdoc', () =>{
    let config = require(paths.jsdoc.config);
    config.opts.destination = paths.jsdoc.dst;
    gulp.src([paths.js.entry,paths.readme.src],{read: false})
    .pipe(jsdoc(config));
})

gulp.task('lint',() =>{
    return gulp.src([paths.js.entry])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
module.exports = gulp.task('scripts', ['source-scripts','jsdoc'])
