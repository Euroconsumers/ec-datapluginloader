let assert  = require('chai').assert;

describe('fixture', () => {
    it('has the expected page title', () => {
      browser.url('/index.html');
      assert.equal(browser.getTitle(), 'ec-dataWidgetLoader');
    });
  });