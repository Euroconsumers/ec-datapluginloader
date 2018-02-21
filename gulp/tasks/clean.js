const
    del         = require('del'),
    gulp        = require('gulp'),
    { paths }   = require('../config');

gulp.task('clean', () => {
    return del([
        paths.dstDir,
        paths.test.output,
        paths.jsdoc.dst
    ]);
});

