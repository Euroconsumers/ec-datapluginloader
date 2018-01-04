const 
    path = require('path'),

    package = require('../package.json'),
    { ENV_DEV }     = require('./envs')

// Main project directory
const 
    rootDir = path.resolve(__dirname, '..'),
    srcDir = path.join(rootDir, 'src'),
    dstDir = ENV_DEV ? path.join(rootDir, '_site') : path.join(rootDir, `_dist/${package.version}`)
    //dstDir = path.join(rootDir, `_dist/${package.version}`)
    //localDir = path.join(rootDir, '_site')

// Structure ready to scale it to bigger files structure, i.e. styles/ js/ directories.
module.exports = {
    pkgname: package.name,
    paths: {
        srcDir,
        dstDir,
        //localDir,
        js: {
            entry: path.join(srcDir, `${package.name}.js`),
            src: path.join(srcDir, '*.js'),
            dst: dstDir,
            //local: localDir
        },
        styles: {
            entry: path.join(srcDir, '*.scss'),
            src: path.join(srcDir, '*.scss'),
            dst: dstDir,
            //local: localDir
        },
        html: {
            src: path.join(srcDir, '*.html'),
            dst: dstDir,
            //local: localDir
        },
        liquid: {
            src: path.join(srcDir, '*.liquid'),
            dst: dstDir,
            //local: localDir
        },
        json: {
            src: path.join(srcDir, '*.json'),
            dst: dstDir,
            //local: localDir
        },
        examples: {
            src: path.join(rootDir, 'examples', '**', '*.*'),
            dst: path.join(dstDir, 'examples')
        },
        test: {
            src: path.join(srcDir, '**', '*.spec.js'),
            output: path.join(rootDir, '_test'),
        },
        libs: {
            src: path.join(rootDir, 'libs', '**', '*.js'),
            dst: path.join(dstDir, 'libs'),
            //local: path.join(localDir, 'libs')
        },
        jsdoc : {
            src: path.join(rootDir,'jsdoc.json')
        },
        readme : {
            src: path.join(rootDir,'README.md')
        }
    }
}