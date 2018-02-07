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
        rootDir,
        srcDir,
        dstDir,
        js: {
            entry: path.join(srcDir, `${package.name}.js`),
            src: path.join(srcDir, '*.js'),
            modules: path.join(srcDir,'modules','*.js'),
            dst: dstDir,
        },
        styles: {
            entry: path.join(srcDir, '*.scss'),
            src: path.join(srcDir, '*.scss'),
            dst: dstDir,
        },
        html: {
            src: path.join(srcDir, '*.html'),
            dst: dstDir,
        },
        liquid: {
            src: path.join(srcDir, '*.liquid'),
            dst: dstDir,
        },
        json: {
            src: path.join(srcDir, '*.json'),
            dst: dstDir,
        },
        test: {
            src: path.join(srcDir, '**', '*.spec.js'),
            output: path.join(rootDir, '_test'),
            reportFile: 'report.json'
        },
        jsdoc : {
            config: path.join(rootDir,'jsdoc.json'),
            dst: path.join(rootDir,'_doc' )
        },
        readme : {
            src: path.join(rootDir,'README.md')
        }
    }
}