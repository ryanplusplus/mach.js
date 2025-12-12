'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('UnexpectedFunctionCallError', () => {
  let UnexpectedFunctionCallError = require('../../src/Error/UnexpectedFunctionCallError.js');

  void it('should stringify correctly without arguments', () => {
    assert.strictEqual(new UnexpectedFunctionCallError({
      name: 'foo'
    }, [], [], []).message, 'Unexpected function call foo()');
  });

  void it('should stringify correctly with arguments', () => {
    assert.strictEqual(new UnexpectedFunctionCallError({
      name: 'foo'
    }, [0, 1], [], []).message, 'Unexpected function call foo(0, 1)');
  });
});
