const
    gulp =          require('gulp'),
    mocha =         require('gulp-mocha'),
    path =          require('path'),

    { paths } =     require('../config'),
    { ENV_DEV } =   require('../envs'),

    mochaLocalConfig = {
        reporter: 'mochawesome',
        reporterOptions: {
            reportDir: paths.test.output,
            reportFilename: paths.test.reportFile,
            autoOpen: true
        }
    }

module.exports = gulp.task('test', () => {
    return gulp.src(paths.test.src)
        .pipe(mocha(ENV_DEV && mochaLocalConfig))
        .once('error', () => {
			process.exit(1);
		})
		.once('end', () => {
			process.exit();
		});
});