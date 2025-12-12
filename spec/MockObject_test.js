'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('MockObject', () => {
  let MockObject = require('../src/MockObject.js');

  void it('should be allowed to be anonymous', () => {
    let a = {
      foo: 'foo',
      bar: function() {
        return 'bar';
      }
    };

    let mockObject = new MockObject(a);

    assert.strictEqual(mockObject.foo, 'foo');
    assert.strictEqual(mockObject.bar._class.name, '<anonymous>.bar');
  });

  void it('should have the name specified', () => {
    let a = {
      foo: 'foo',
      bar: function() {
        return 'bar';
      }
    };

    let mockObject = new MockObject(a, 'a');

    assert.strictEqual(mockObject.foo, 'foo');
    assert.strictEqual(mockObject.bar._class.name, 'a.bar');
  });
});
