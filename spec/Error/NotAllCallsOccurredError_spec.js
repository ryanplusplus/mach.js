'use strict';

describe('NotAllCallsOccurredError', () => {
  let NotAllCallsOccurredError = require('../../src/Error/NotAllCallsOccurredError.js');

  it('should stringify correctly', () => {
    expect(new NotAllCallsOccurredError([], []).message).toEqual('Not all calls occurred\n');
  });
});
