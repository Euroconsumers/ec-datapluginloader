  const
    gulp            = require('gulp'),
    gulpIf          = require('gulp-if'),
    gutil           = require('gulp-util'),
    gulpRename      = require('gulp-rename'),
    gulpLiquify     = require('gulp-liquify'),

    { paths }       = require('../config'),
    { ENV_DEV }     = require('../envs')

module.exports = gulp.task('liquid', () => {
    return gulp.src(paths.liquid.src)
        .pipe(gulpIf(ENV_DEV, gulpLiquify()))
        .pipe(gulpIf(ENV_DEV, gulpRename((path) => {
            path.extname = `.html`;
            })))
        .pipe(gulpIf(ENV_DEV, gulp.dest(paths.liquid.dst)))
});
