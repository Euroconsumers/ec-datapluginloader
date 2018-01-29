let
  assert = require('chai').assert

describe('E2E suite', function () {

  xit('has the expected page title', function (done) {
    driver.get(`http://localhost:8080/index.html`);
    driver.getTitle().then(function (data) {
      assert.equal(data, 'ec-dataWidgetLoader');
    }).then(done);
  });
});