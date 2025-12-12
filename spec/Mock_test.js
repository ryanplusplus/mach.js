'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('Mock', () => {
  let Expectation = require('../src/Expectation.js');
  let Mock = require('../src/Mock.js');
  let UnexpectedFunctionCallError = require('../src/Error/UnexpectedFunctionCallError.js');

  void it('should throw an error when called outside of a when thunk depending on if Mock.ignoreOtherCalls is set to true', () => {
    let a = new Mock('a');
    let b = new Mock('b');

    assert.throws(() => b(), UnexpectedFunctionCallError);

    a._class.ignoreOtherCalls = true;

    assert.doesNotThrow(() => b(), UnexpectedFunctionCallError);

    a._class.reset();

    assert.throws(() => b(), UnexpectedFunctionCallError);
  });

  void it('shouldBeCalled should return a required Expectation', () => {
    let mock = new Mock('mock');

    let expectation = mock.shouldBeCalled();

    assert.strictEqual(expectation instanceof Expectation, true);
    assert.strictEqual(expectation._expectedCall.required, true);
  });

  void it('mayBeCalled should return an optional Expectation', () => {
    let mock = new Mock('mock');

    let expectation = mock.mayBeCalled();

    assert.strictEqual(expectation instanceof Expectation, true);
    assert.strictEqual(expectation._expectedCall.required, false);
  });
});
