const
    gulp            = require('gulp'),
    gulpSequence    = require('gulp-sequence'),
    { ENV_DEV }     = require('../envs')


gulp.task('pre-build', ENV_DEV ? ['clean', 'server', 'watch'] : ['clean'])

gulp.task('build', gulpSequence('pre-build', ['static', 'liquid', 'scripts', 'styles']))
