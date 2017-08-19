const
    gulp        = require('gulp'),

    { paths }   = require('../config')

module.exports = gulp.task('examples', () => {
    return gulp.src(paths.examples.src)
    .pipe(gulp.dest(paths.examples.dst))
})