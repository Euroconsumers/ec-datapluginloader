const
    babel = require('gulp-babel'),
    gulp = require('gulp'),
    gulpSequence = require('gulp-sequence'),
    mocha = require('gulp-mocha'),
    webserver = require('gulp-webserver'),


    { paths } = require('../config'),
    { ENV_DEV } = require('../envs'),

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

let 
    stream,
    port = 8080;
const isPortTaken = function (port, fn) {
    var net = require('net')
    var tester = net.createServer()
        .once('error', function (err) {
            if (err.code != 'EADDRINUSE') return fn(err)
            fn(null, true)
        })
        .once('listening', function () {
            tester.once('close', function () { fn(null, false) })
                .close()
        })
        .listen(port)
}

gulp.task('test:serverStart', () => {
    process.env.PORT = port
    stream = gulp.src(paths.dstDir)
        .pipe(webserver({
            port: port,
            directoryListing: {
                enable: true,
                path: paths.dstDir
            }
        }));

    return stream;
});

gulp.task('test:serverStop', (done) => {
    stream.emit('kill');
    done();
});

gulp.task('test:findPort', (done) => {
    let checkForPort = (tstport) => {
        isPortTaken(tstport, (err, isTaken) => {
            if (isTaken) {
                port++;
                checkForPort(port);
            } else {
                done(err);
            }
        })
    };
    return checkForPort(port);
});

gulp.task('test:mocha', (done) => {
    return gulp.src(paths.test.src)
        .pipe(mocha((ENV_DEV && mochaLocalConfig) || mochaConfig))
        .once('error', () => {
            done();
            process.exit(1);
        })
        .once('end', () => {
            done();
            process.exit();
        });
});

module.exports = gulp.task('test',gulpSequence('test:findPort','test:serverStart', 'test:mocha', 'test:serverStop'));
