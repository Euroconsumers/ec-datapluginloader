const
    browserSync         = require('browser-sync').create(),
    gulp                = require('gulp'),

    { paths,pkgname }   = require('../config');

module.exports = gulp.task('server', () => {
    browserSync.init({
        server: {
            baseDir: paths.dstDir,
            index: `${pkgname}.html`,
            serveStaticOptions: {
                extensions: ['html']
            },
            directory: true
        },
        port:   8080,
        notify: true
    });
});