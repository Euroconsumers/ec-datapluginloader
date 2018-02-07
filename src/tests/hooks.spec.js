const
    selenium = require('selenium-webdriver'),
    { name,version } = require('../../package.json')

beforeEach(function () {
    driver = new selenium.Builder()
        .withCapabilities({
            'browserName': 'chrome',
            'username': process.env.SAUCE_USERNAME,
            'accessKey': process.env.SAUCE_ACCESS_KEY,
            'name': `${name} - ${this.currentTest.parent.fullTitle()} - ${this.currentTest.title}`,
            'tags': ['widget'],
            'build': version,
            'tunnelIdentifier': `${process.env.SAUCE_USERNAME}\'s Tunnel` //Tunnel name to be used 
        })
        .usingServer(`https://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@ondemand.saucelabs.com:443/wd/hub`)
        .build();
});

afterEach(function (){
    driver.executeScript(`sauce:job-result=${this.currentTest.state}`)
    return driver.quit();
})