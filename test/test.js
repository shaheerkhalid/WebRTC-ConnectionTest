
'use strict';
export default {
  'Checking that the ICE candidates are populated when the button is pressed.': (browser) => {
    const path = '../index.html';
    const url = 'file://' + process.cwd() + path;

    browser.url(url).waitForElementVisible('#gather', 1000, 'Check that the gather candidate button is visible');
    browser.expect.element('tbody#candidatesBody tr:first-child').to.not.be.present.before(100);
    browser.click('#gather');
    browser.expect.element('tbody#candidatesBody tr:first-child').to.be.visible.before(5000);
    browser.end();
  }
};
