let
  assert = require('chai').assert,
  ip = require('ip'),
  proxy = require('selenium-webdriver/proxy'),
  selenium = require('selenium-webdriver'),
  driver;

describe('fixture', function () {

  beforeEach(function () {
    driver = new selenium.Builder()
      .withCapabilities({
        'browserName': 'chrome',
        'username': 'sso-euroconsumers-RDesaegher',
        'accessKey': '2b72fd85-6d51-4d86-a49b-9ca53e21bb12',
        'name': 'ec-datapluginloader tests',
        'tags': ['widget', 'critical'],
        'build': '1.0.0'
      })
      .setProxy(proxy.manual({https:'int-selproxy.internet.conseur.org:3128', http: 'int-selproxy.internet.conseur.org:3128'}))
      .usingServer('https://ondemand.saucelabs.com:443/wd/hub')
      .build();
  });


  afterEach(function(){
    driver.executeScript(`sauce:job-result=${this.currentTest.state}`);
  });

  after(function(){
    return driver.quit();
  })
  xit('has the expected page title', function (done) {
    this.timeout(50000);
    driver.get(`http://10.1.30.242:8080/index.html`);
    driver.getTitle().then(function (data) {
      assert.equal(data, 'ec-dataWidgetLoader');
    }).then(done);
  });
});