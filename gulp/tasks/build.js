const
    gulp            = require('gulp'),
    sequence        = require('gulp-sequence'),
    { ENV_DEV }     = require('../envs');


gulp.task('pre-build', ENV_DEV ? ['clean', 'server', 'watch'] : ['clean']);

gulp.task('build', sequence('pre-build', ['static', 'liquid', 'scripts', 'styles']));
