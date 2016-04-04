'use strict';

describe('AndNode', () => {
  let Node = require('../../src/Tree/Node.js');
  let AndNode = require('../../src/Tree/AndNode.js');
  let ExpectedCallNode = require('../../src/Tree/ExpectedCallNode.js');

  it('should be named AND + expectedCalls', () => {
    expect(new AndNode({
      name: 'foo'
    }).name).toEqual('AND {{ foo }}');
  });

  it('should have an expectedCall', () => {
    expect(new AndNode({
      name: 'foo'
    }).expectedCalls[0].name).toEqual('foo');
  });

  describe('merge', () => {
    it('should merge with another AndNode', () => {
      let a = new AndNode({
        name: 'a'
      });

      let b = new AndNode({
        name: 'b'
      });

      a.merge(b);

      expect(a.expectedCalls.length).toEqual(2);

      expect(a.expectedCalls[0].name).toEqual('a');
      expect(a.expectedCalls[1].name).toEqual('b');
    });

    it('should merge with an ExpectedCallNode', () => {
      let a = new AndNode({
        name: 'a'
      });

      let b = new ExpectedCallNode({
        name: 'b'
      });

      a.merge(b);

      expect(a.expectedCalls.length).toEqual(2);

      expect(a.expectedCalls[0].name).toEqual('a');
      expect(a.expectedCalls[1].name).toEqual('b');
    });

    it('should throw an error if node is invalid type', () => {
      let a = new AndNode({
        name: 'a'
      });

      let b = new Node('node');

      expect(() => a.merge(b))
        .toThrowError('Unexpected type for node, expected AndNode or ExpectedCallNode');
    });
  });

  describe('toString()', () => {
    it('should include expectedCalls', () => {
      let a = new AndNode({
        name: 'a'
      });

      let b = new AndNode({
        name: 'b'
      });

      expect(a.toString()).toEqual('{ AND {{ a }} }');

      a.merge(b);

      expect(a.toString()).toEqual('{ AND {{ a, b }} }');
    });

    it('should include the child if it exists', () => {
      let a = new AndNode({
        name: 'a'
      });

      let b = new AndNode({
        name: 'b'
      });

      a.child = b;

      expect(a.toString()).toEqual('{ AND {{ a }} [{ AND {{ b }} }] }');
    });
  });
});
