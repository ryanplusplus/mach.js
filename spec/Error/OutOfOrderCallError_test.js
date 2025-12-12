'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('OutOfOrderCallError', () => {
  let OutOfOrderCallError = require('../../src/Error/OutOfOrderCallError.js');

  void it('should stringify correctly without args', () => {
    assert.strictEqual(
      new OutOfOrderCallError({
        name: 'foo'
      }, [], [], []).message,
      'Out of order function call foo()'
    );
  });
});
