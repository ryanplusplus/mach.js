'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('RootNode', () => {
  let RootNode = require('../../src/Tree/RootNode.js');

  void it('should be named ROOT', () => {
    assert.strictEqual(new RootNode().name, 'ROOT');
  });
});
