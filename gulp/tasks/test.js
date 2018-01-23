const
    gulp            = require('gulp'),
    gulpSequence    = require('gulp-sequence'),
    Launcher        = require('webdriverio/build/lib/launcher'),
    marge           = require('mochawesome-report-generator'),
    mocha           = require('gulp-mocha'),
    path            = require('path'),
    package         = require('../../package.json'),

    { paths }       = require('../config'),
    { ENV_DEV }     = require('../envs')
    
    wdio            = new Launcher(paths.webdriver.config),
    
gulp.task('test',() => {
    return wdio.run(code => {
        process.exit(code);
      }, error => {
        console.error('Launcher failed to start the test', error.stacktrace);
        process.exit(1);
      });
});

gulp.task('report',() => {
    let config = require(path.join(paths.test.output,paths.test.reportFile))
    return marge.create(config,{
        reportDir : paths.test.output
    });
});

module.exports = gulp.task('e2e',(callback) => {
    gulpSequence('test','report')(callback);
});