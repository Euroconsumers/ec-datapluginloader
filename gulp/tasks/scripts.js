const
    babel               = require('gulp-babel'),
    browserSync         = require('browser-sync').create(),
    eslint              = require('gulp-eslint'),
    gulp                = require('gulp'),
    gulpIf              = require('gulp-if'),
    util                = require('gulp-util'),
    rename              = require('gulp-rename'),
    rollup              = require('gulp-rollup'),
    uglify              = require('gulp-uglify'),
    stripDebug          = require('gulp-strip-debug'),
    jsdoc               = require('gulp-jsdoc3'),
    path                = require('path'),
    sourcemaps          = require('gulp-sourcemaps'),
    
    { paths, pkgname }  = require('../config'),
    { ENV_DEV }         = require('../envs');

gulp.task('source-scripts', () => {
    return gulp.src([path.join(paths.js.entry),path.join(paths.js.modules)])
    .pipe(gulpIf(ENV_DEV, sourcemaps.init({ loadMaps: true})))
    .pipe(babel())
    .pipe(rollup({
        output: {
            format:'iife'
        },
        input: path.join(paths.js.entry)
    }))
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

    gulp.src([paths.js.entry,paths.readme.src],{read: false})
    .pipe(jsdoc(config));

});

gulp.task('lint',() =>{
    return gulp.src([paths.js.entry])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('scripts', ['source-scripts','jsdoc','lint']);
