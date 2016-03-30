'use strict';

describe('NotAllCallsOccurredError', () => {
  let NotAllCallsOccurredError = require('../../src/Error/NotAllCallsOccurredError.js');

  it('should stringify correctly without arguments', () => {
    expect(new NotAllCallsOccurredError({
      _name: 'foo'
    }, [], [], []).message).toEqual('Out of order function call foo()');
  });

  it('should stringify correctly with arguments', () => {
    expect(new NotAllCallsOccurredError({
      _name: 'foo'
    }, [0, 1], [], []).message).toEqual('Out of order function call foo(0, 1)');
  });
});
