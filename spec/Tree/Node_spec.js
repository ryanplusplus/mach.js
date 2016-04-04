'use strict';

describe('Node', () => {
  let Node = require('../../src/Tree/Node.js');

  describe('toString()', () => {
    it('should return just the name if it does not have a child', () => {
      expect(new Node('node').toString()).toEqual('{ node }');
    });

    it('should include the child if it exists', () => {
      let node = new Node('node');
      node.child = new Node('child');

      expect(node.toString()).toEqual('{ node [{ child }] }');
    });
  });
});
