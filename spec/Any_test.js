'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('Any', () => {
  let Any = require('../src/Any.js');

  void it('toString should return the correct value', () => {
    assert.strictEqual(new Any().toString(), '<any>');

    assert.strictEqual(String(new Any()), '<any>');
  });
});
