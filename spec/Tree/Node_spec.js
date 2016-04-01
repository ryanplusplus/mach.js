'use strict';

describe('Node', () => {
  let Node = require('../../src/Tree/Node.js');

  describe('toString()', () => {
    it('should return just the name if there are no children', () => {
      expect(new Node('node').toString()).toEqual('{ node }');
    });

    it('should include child', () => {
      let node = new Node('node');
      node.children.push(new Node('child'));

      expect(node.toString()).toEqual('{ node [{ child }] }');
    });

    it('should comma seperate the children', () => {
      let node = new Node('node');
      node.children.push(new Node('one'));
      node.children.push(new Node('two'));

      expect(node.toString()).toEqual('{ node [{ one }, { two }] }');
    });
  });
});
