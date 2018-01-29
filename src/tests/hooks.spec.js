let
    selenium = require('selenium-webdriver');

beforeEach(function () {
    console.log(this.currentTest.parent.fullTitle())
    driver = new selenium.Builder()
        .withCapabilities({
            'browserName': 'chrome',
            'username': 'sso-euroconsumers-RDesaegher',
            'accessKey': '2b72fd85-6d51-4d86-a49b-9ca53e21bb12',
            'name': `ec-datapluginloader - ${this.currentTest.parent.fullTitle()} - ${this.currentTest.title}`,
            'tags': ['widget', 'critical'],
            'build': '1.0.0',
            'tunnelIdentifier': 'Raphael\'s Tunnel' //Tunnel name to be used 
        })
        .usingServer('http://sso-euroconsumers-RDesaegher:2b72fd85-6d51-4d86-a49b-9ca53e21bb12@ondemand.saucelabs.com:80/wd/hub')
        .build();
});

afterEach(function (){
    driver.executeScript(`sauce:job-result=${this.currentTest.state}`)
    return driver.quit();
})