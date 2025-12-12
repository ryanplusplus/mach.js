'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('Node', () => {
  let Node = require('../../src/Tree/Node.js');

  void describe('toString()', () => {
    void it('should return just the name if it does not have a child', () => {
      assert.strictEqual(new Node('node').toString(), '{ node }');
    });

    void it('should include the child if it exists', () => {
      let node = new Node('node');
      node.child = new Node('child');

      assert.strictEqual(node.toString(), '{ node [{ child }] }');
    });
  });
});
