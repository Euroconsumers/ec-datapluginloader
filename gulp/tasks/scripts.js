const
    babel               = require('gulp-babel'),
    browserSync         = require('browser-sync').create(),
    buffer              = require('vinyl-buffer'),
    eslint              = require('gulp-eslint'),
    gulp                = require('gulp'),
    gulpIf              = require('gulp-if'),
    jsdoc               = require('gulp-jsdoc3'),
    path                = require('path'),
    rename              = require('gulp-rename'),
    rollup              = require('rollup-stream'),
    rollupResolve       = require('rollup-plugin-node-resolve'),
    source              = require('vinyl-source-stream')
    sourcemaps          = require('gulp-sourcemaps'),
    stripDebug          = require('gulp-strip-debug'),
    uglify              = require('gulp-uglify'),
    util                = require('gulp-util'),
    
    { paths, pkgname }  = require('../config'),
    { ENV_DEV }         = require('../envs');

gulp.task('source-scripts', () => {
    
    return rollup({
        format:'iife',
        input: paths.js.entry,
        sourcemap:true
    })
    .pipe(source(`${pkgname}.js`))
    .pipe(buffer())
    .pipe(gulpIf(ENV_DEV, sourcemaps.init({ loadMaps: true})))
    .pipe(babel())
    .pipe(uglify().on('error', util.log))
    .pipe(gulpIf(!ENV_DEV, stripDebug()))
    .pipe(gulpIf(!ENV_DEV, rename((path) => {
        path.extname = `.min` + path.extname;
      })))
    .pipe(gulpIf(ENV_DEV, sourcemaps.write('.')))
    .pipe(gulp.dest(paths.js.dst))
    .pipe(gulpIf(ENV_DEV, browserSync.reload({ stream: true })))

})

gulp.task('jsdoc', () =>{
    let config = require(paths.jsdoc.config);
    config.opts.destination = paths.jsdoc.dst;

    gulp.src([paths.js.entry,paths.js.modules,paths.readme.src],{read: false})
    .pipe(jsdoc(config));

});

gulp.task('lint',() =>{
    return gulp.src([paths.js.entry])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('scripts', ['source-scripts','jsdoc','lint']);
