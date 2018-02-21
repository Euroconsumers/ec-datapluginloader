const
    gulp        = require('gulp'),
    gulpIf      = require('gulp-if'),
    rename      = require('gulp-rename'),
    liquify     = require('gulp-liquify'),
    { paths }   = require('../config'),
    { ENV_DEV } = require('../envs');

gulp.task('liquid', () => {
    return gulp.src(paths.liquid.src)
    .pipe(gulpIf(ENV_DEV, liquify()))
    .pipe(gulpIf(ENV_DEV, rename((path) => {
        path.extname = `.html`;
    })))
    .pipe(gulpIf(ENV_DEV, gulp.dest(paths.liquid.dst)))
});
