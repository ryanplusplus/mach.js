'use strict';

describe('AndNode', () => {
  let Node = require('../../src/Tree/Node.js');
  let AndNode = require('../../src/Tree/AndNode.js');
  let ExpectedCallNode = require('../../src/Tree/ExpectedCallNode.js');
  let Mock = require('../../src/Mock.js');
  let ExpectedCall = require('../../src/ExpectedCall.js');

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

  describe('match', () => {
    it('should return undefined if all the calls are completed', () => {
      let mock = new Mock('mock');
      let a = new AndNode(new ExpectedCall(mock._class, [], true, false));
      let b = new AndNode(new ExpectedCall(mock._class, [], true, false));

      a.merge(b);

      for(let expectedCall of a.expectedCalls) {
        expectedCall.execute([]);
      }

      expect(a.match(mock._class, [])).toBeUndefined();
    });

    it('should return undefined if no expected calls match', () => {
      let mock = new Mock('mock');
      let a = new AndNode(new ExpectedCall(new Mock('a')._class, [], true, true));
      let b = new AndNode(new ExpectedCall(mock._class, [0], true, true));

      a.merge(b);

      expect(a.match(mock, [1])).toBeUndefined();
    });

    it('should return an expected call if the expected call matches', () => {
      let mock = new Mock('mock');
      let a = new AndNode(new ExpectedCall(mock._class, [], true, true));

      expect(a.match(mock._class, [])).not.toBeUndefined();
    });
  });

  describe('partialMatch', () => {
    it('should return false if all the calls are completed', () => {
      let mock = new Mock('mock');
      let a = new AndNode(new ExpectedCall(mock._class, [], true, false));
      let b = new AndNode(new ExpectedCall(mock._class, [], true, false));

      a.merge(b);

      for(let expectedCall of a.expectedCalls) {
        expectedCall.execute([]);
      }

      expect(a.partialMatch(mock, [])).toBe(false);
    });

    it('should return false if no expected calls match', () => {
      let mock = new Mock('mock');
      let a = new AndNode(new ExpectedCall(new Mock('a')._class, [], true, true));
      let b = new AndNode(new ExpectedCall(new Mock('b')._class, [], true, true));

      a.merge(b);

      expect(a.partialMatch(mock, [])).toBe(false);
    });

    it('should return an expected call if the expected call matches', () => {
      let mock = new Mock('mock');
      let a = new AndNode(new ExpectedCall(mock._class, [], true, true));

      expect(a.partialMatch(mock._class, [])).toBe(true);
    });
  });

  describe('onlyOptionalRemain', () => {
    it('should return true if all calls are complete', () => {
      let mock = new Mock('mock');
      let a = new AndNode(new ExpectedCall(mock._class, [], true, false));
      let b = new AndNode(new ExpectedCall(mock._class, [], true, false));

      a.merge(b);

      for(let expectedCall of a.expectedCalls) {
        expectedCall.execute([]);
      }

      expect(a.onlyOptionalRemain()).toBe(true);
    });

    it('should return false if any incomplete calls are required', () => {
      let mock = new Mock('mock');
      let a = new AndNode(new ExpectedCall(mock._class, [], true, false));
      let b = new AndNode(new ExpectedCall(mock._class, [], true, false));

      a.merge(b);

      a.expectedCalls[0].execute([]);

      expect(a.onlyOptionalRemain()).toBe(false);
    });

    it('should return true if all incomplete calls are optional', () => {
      let mock = new Mock('mock');
      let a = new AndNode(new ExpectedCall(mock._class, [], true, false));
      let b = new AndNode(new ExpectedCall(mock._class, [], false, false));

      a.merge(b);

      a.expectedCalls[0].execute([]);

      expect(a.onlyOptionalRemain()).toBe(true);
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
