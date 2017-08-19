const
    gulp            = require('gulp'),
    mocha           = require('gulp-mocha'),

    { paths }        = require('../config'),
    package         = require('../../package.json'),
    { ENV_DEV }     = require('../envs')


const mochaLocalConfig = {
    reporter: 'mochawesome',
        reporterOptions: {
            reportDir: paths.test.output,
            reportFilename: package.name,
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
		})

});

