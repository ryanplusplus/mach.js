'use strict';

describe('Mock', () => {
  let Expectation = require('../src/Expectation.js');
  let Mock = require('../src/Mock.js');
  let UnexpectedFunctionCallError = require('../src/Error/UnexpectedFunctionCallError.js');

  it('should throw an error when called outside of a when thunk depending on if Mock.ignoreOtherCalls is set to true', () => {
    let a = new Mock('a');
    let b = new Mock('b');

    expect(() => b()).toThrowError(UnexpectedFunctionCallError);

    a._class.ignoreOtherCalls = true;

    expect(() => b()).not.toThrowError(UnexpectedFunctionCallError);

    a._class.reset();

    expect(() => b()).toThrowError(UnexpectedFunctionCallError);
  });

  it('shouldBeCalled should return a required Expectation', () => {
    let mock = new Mock('mock');

    let expectation = mock.shouldBeCalled();

    expect(expectation instanceof Expectation).toBe(true);
    expect(expectation._expectedCall.required).toBe(true);
  });

  it('mayBeCalled should return an optional Expectation', () => {
    let mock = new Mock('mock');

    let expectation = mock.mayBeCalled();

    expect(expectation instanceof Expectation).toBe(true);
    expect(expectation._expectedCall.required).toBe(false);
  });
});
