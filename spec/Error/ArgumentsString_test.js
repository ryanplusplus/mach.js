'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('ArgumentsString', () => {
  let ArgumentsString = require('../../src/Error/ArgumentsString.js');
  let Same = require('../../src/Same.js');

  void it('should return an empty string for no args', () => {
    assert.strictEqual(new ArgumentsString([]).toString(), '');
  });

  void it('should extract value from Same', () => {
    assert.strictEqual(new ArgumentsString([new Same(0)]).toString(), '0');
  });

  void it('should convert undefined into a string', () => {
    assert.strictEqual(new ArgumentsString([undefined]).toString(), 'undefined');
  });

  void it('should convert null into a string', () => {
    assert.strictEqual(new ArgumentsString([null]).toString(), 'null');
  });

  void it('should convert array into a string', () => {
    assert.strictEqual(new ArgumentsString([
      [0, 1, 2]
    ]).toString(), '[0, 1, 2]');
  });

  void it('should put quotes on strings', () => {
    assert.strictEqual(new ArgumentsString(['0']).toString(), '\'0\'');
  });

  void it('should combine multiple arguments into a single string', () => {
    assert.strictEqual(new ArgumentsString([0, '1', [2, '3', null], undefined])
      .toString(), '0, \'1\', [2, \'3\', null], undefined');
  });

  void it('should automatically convert into a string', () => {
    let argsString = new ArgumentsString([0]);
    assert.strictEqual('' + argsString, '0');
    assert.strictEqual(argsString + '', '0');
  });

  void it('should handle undefined', () => {
    let argsString = new ArgumentsString([{ sam: undefined, ryan: 1000 }]);
    assert.strictEqual('' + argsString, '{"sam":"undefined","ryan":1000}');
  });
});
