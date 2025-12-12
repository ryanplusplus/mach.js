'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('UnexpectedArgumentsError', () => {
  let UnexpectedArgumentsError = require('../../src/Error/UnexpectedArgumentsError.js');

  void it('should stringify correctly without arguments', () => {
    assert.strictEqual(new UnexpectedArgumentsError({
      name: 'foo'
    }, [], [], []).message, 'Unexpected arguments () provided to function foo');
  });

  void it('should stringify correctly with arguments', () => {
    assert.strictEqual(new UnexpectedArgumentsError({
      name: 'foo'
    }, [0, 1], [], []).message, 'Unexpected arguments (0, 1) provided to function foo');
  });
});
