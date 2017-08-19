module.exports = {
    ENV_DEV: !!((process.env.NODE_ENV === 'dev') || 
        process.argv.find(el => el === '--dev')),
}