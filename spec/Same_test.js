'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('Same', () => {
  let Same = require('../src/Same.js');

  void it('should have the right value', () => {
    var value = 0;
    assert.strictEqual(new Same(value).value, value);
  });

  void it('should default matcher to _.isEqual', () => {
    var same = new Same(0);

    assert.notStrictEqual(same.matcher, undefined);

    assert.strictEqual(same.matcher.length, 2);
    assert.strictEqual(same.matcher(0, 0), true);
    assert.strictEqual(same.matcher(0, 1), false);
  });

  void it('should have specified matcher', () => {
    var matcher = (a, b) => {
      return a !== b;
    };

    var same = new Same(0, matcher);

    assert.strictEqual(same.matcher.length, 2);
    assert.strictEqual(same.matcher(0, 1), true);
    assert.strictEqual(same.matcher(0, 0), false);
  });

  void it('should stringify nicely', () => {
    assert.strictEqual(new Same(0).toString(), 'Same {value: 0, matcher: (a, b) => eq(a, b)}');
  });
});
