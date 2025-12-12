'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('FunctionCallsString', () => {
  let FunctionCallsString = require('../../src/Error/FunctionCallsString.js');

  void it('should return empty string if there are no expected calls', () => {
    assert.strictEqual(
      new FunctionCallsString([], []).toString(),
      ''
    );
  });

  void it('should stringify calls', () => {
    assert.strictEqual(
      new FunctionCallsString([{
        name: 'foo',
        actualArgs: [],
        completed: true
      }, {
        name: 'bar',
        checkArgs: true,
        expectedArgs: [],
        completed: false
      }, {
        name: 'baz',
        checkArgs: false,
        expectedArgs: [],
        completed: false
      }]).toString(),
      '\nCompleted calls:\n\tfoo()\nIncomplete calls:\n\tbar()\n\tbaz(<any>)'
    );
  });
});
