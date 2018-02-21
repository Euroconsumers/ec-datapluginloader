const
    gulp        = require('gulp'),

    { paths }   = require('../config')

module.exports = gulp.task('watch', () => {
    gulp.watch([paths.js.src,paths.js.modules], ['scripts'])
    gulp.watch([paths.styles.src], ['styles'])
    gulp.watch([paths.html.src, paths.json.src], ['static'])
    gulp.watch([paths.liquid.src], ['liquid'])
})