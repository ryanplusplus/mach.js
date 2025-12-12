'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('NotAllCallsOccurredError', () => {
  let NotAllCallsOccurredError = require('../../src/Error/NotAllCallsOccurredError.js');

  void it('should stringify correctly', () => {
    assert.strictEqual(new NotAllCallsOccurredError([], []).message, 'Not all calls occurred');
  });
});
