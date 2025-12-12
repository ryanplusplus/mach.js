'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('Callback', () => {
  let Callback = require('../src/Callback.js');

  void it('toString should return the correct value', () => {
    assert.strictEqual(new Callback().toString(), '<callback>');

    assert.strictEqual(String(new Callback()), '<callback>');
  });
});
