const
    gulp =          require('gulp'),
    mocha =         require('gulp-mocha'),

    { paths } =     require('../config'),
    { ENV_DEV } =   require('../envs'),

    mochaConfig = {
        timeout: 30000,
        globals: ['driver']
    },
    mochaLocalConfig = {
        reporter: 'mochawesome',
        reporterOptions: {
            reportDir: paths.test.output,
            reportFilename: paths.test.reportFile,
            autoOpen: true
        },
        timeout: 30000,
        globals: ['driver']
    }

    let driver;

module.exports = gulp.task('test', () => {
    return gulp.src(paths.test.src)
        .pipe(mocha((ENV_DEV && mochaLocalConfig)||mochaConfig))
        .once('error', () => {
			process.exit(1);
		})
		.once('end', () => {
			process.exit();
		});
});