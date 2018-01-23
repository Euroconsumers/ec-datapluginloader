const
    gulp        = require('gulp'),

    { paths }   = require('../config')

module.exports = gulp.task('watch', () => {
    gulp.watch([paths.js.src,paths.js.modules], ['scripts','e2e'])
    gulp.watch([paths.styles.src], ['styles','e2e'])
    gulp.watch([paths.html.src, paths.json.src], ['static','e2e'])
    gulp.watch([paths.liquid.src], ['liquid','e2e'])
})