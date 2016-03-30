'use strict';

describe('OutOfOrderCallError', () => {
  let OutOfOrderCallError = require('../../src/Error/OutOfOrderCallError.js');

  it('should stringify correctly', () => {
    expect(new OutOfOrderCallError([], []).message).toEqual('Not all calls occurred\n');
  });
});
