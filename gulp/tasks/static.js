const
    gulp        = require('gulp'),
    gulpIf      = require('gulp-if'),

    { paths }   = require('../config'),
    { ENV_DEV } = require('../envs')

gulp.task('html', () => {
    return gulp.src(paths.html.src)
        .pipe(gulp.dest(paths.html.dst))
})

gulp.task('dependencies', () => {
    return gulp.src(paths.json.src)
        .pipe(gulp.dest(paths.json.dst))
})

module.exports = gulp.task('static', ['html', 'dependencies'])