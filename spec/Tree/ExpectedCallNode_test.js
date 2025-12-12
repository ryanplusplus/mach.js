'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('ExpectedCallNode', () => {
  let ExpectedCallNode = require('../../src/Tree/ExpectedCallNode.js');

  void it('should be named after it\'s expected call', () => {
    assert.strictEqual(new ExpectedCallNode({
      name: 'foo'
    }).name, 'foo');
  });
});
