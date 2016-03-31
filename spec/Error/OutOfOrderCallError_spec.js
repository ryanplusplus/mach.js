'use strict';

describe('OutOfOrderCallError', () => {
  let OutOfOrderCallError = require('../../src/Error/OutOfOrderCallError.js');

  it('should stringify correctly without args', () => {
    expect(new OutOfOrderCallError({
      _name: 'foo'
    }, [], [], []).message).toEqual('Out of order function call foo()');
  });
});
