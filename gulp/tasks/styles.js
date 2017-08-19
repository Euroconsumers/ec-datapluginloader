 const
    autoprefixer    = require('gulp-autoprefixer'),
    browserSync     = require('browser-sync').create(),
    gulp            = require('gulp'),
    gulpIf          = require('gulp-if'),
    gulpRename      = require('gulp-rename'),
    moduleImporter  = require('sass-module-importer'),
    plumber         = require('gulp-plumber'),
    sass            = require('gulp-sass'),
    sourcemaps      = require('gulp-sourcemaps'),

    { paths }       = require('../config'),
    { ENV_DEV }     = require('../envs')

module.exports = gulp.task('styles', () => {
    return gulp.src(paths.styles.entry)
    .pipe(plumber())
    .pipe(gulpIf(ENV_DEV, sourcemaps.init()))
    .pipe(sass({
        importer:        moduleImporter(),
        errLogToConsole: true,
        precision:       2,
        outputStyle:     'compressed'
    }))
    .pipe(autoprefixer({
        flexbox: false,
		browsers: ['last 2 versions', 'ie 11', 'android >= 4.1'], // allow jelly bean
        cascade: false
    }))
    .pipe(gulpIf(!ENV_DEV, gulpRename((path) => {
        path.extname = `.min` + path.extname;
      })))
    .pipe(gulpIf(ENV_DEV, sourcemaps.write('./')))
    .pipe(gulp.dest(paths.styles.dst))
    .pipe(gulpIf(ENV_DEV, browserSync.reload({ stream: true })));
});
