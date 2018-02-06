let
  assert = require('chai').assert

describe('E2E suite', function () {

  it('has the expected page title', function (done) {
    driver.get(`http://localhost:${process.env.PORT}/index.html`);
    driver.getTitle().then(function (data) {
      assert.equal(data, 'ec-dataWidgetLoader');
    }).then(done);
  });
});