const
    browserSync     = require('browser-sync').create(),
    gulp            = require('gulp'),
    path            = require('path'),

    { paths }       = require('../config'),
    { name }        = require('../../package.json')

module.exports = gulp.task('server', () => {
    browserSync.init({
        server: {
            baseDir: paths.dstDir,
            index: `${name}.html`,
            serveStaticOptions: {
                extensions: ['html']
            },
            directory: true
        },
        port:   8080,
        notify: true
    });
});