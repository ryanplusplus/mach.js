'use strict';

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

void describe('AndNode', () => {
  const Node = require('../../src/Tree/Node.js');
  const AndNode = require('../../src/Tree/AndNode.js');
  const ExpectedCallNode = require('../../src/Tree/ExpectedCallNode.js');
  const Mock = require('../../src/Mock.js');
  const ExpectedCall = require('../../src/ExpectedCall.js');

  void it('should be named AND + expectedCalls', () => {
    assert.strictEqual(new AndNode({ name: 'foo' }).name, 'AND {{ foo }}');
  });

  void it('should have an expectedCall', () => {
    assert.strictEqual(new AndNode({ name: 'foo' }).expectedCalls[0].name, 'foo');
  });

  void describe('merge', () => {
    void it('should merge with another AndNode', () => {
      const a = new AndNode({ name: 'a' });
      const b = new AndNode({ name: 'b' });

      a.merge(b);

      assert.strictEqual(a.expectedCalls.length, 2);
      assert.strictEqual(a.expectedCalls[0].name, 'a');
      assert.strictEqual(a.expectedCalls[1].name, 'b');
    });

    void it('should merge with an ExpectedCallNode', () => {
      const a = new AndNode({ name: 'a' });
      const b = new ExpectedCallNode({ name: 'b' });

      a.merge(b);

      assert.strictEqual(a.expectedCalls.length, 2);
      assert.strictEqual(a.expectedCalls[0].name, 'a');
      assert.strictEqual(a.expectedCalls[1].name, 'b');
    });

    void it('should throw an error if node is invalid type', () => {
      const a = new AndNode({ name: 'a' });
      const b = new Node('node');

      assert.throws(() => a.merge(b), /Unexpected type for node, expected AndNode or ExpectedCallNode/);
    });
  });

  void describe('match', () => {
    void it('should return undefined if all the calls are completed', () => {
      const mock = new Mock('mock');
      const a = new AndNode(new ExpectedCall(mock._class, [], true, false));
      const b = new AndNode(new ExpectedCall(mock._class, [], true, false));

      a.merge(b);

      for(const expectedCall of a.expectedCalls) {
        expectedCall.execute([]);
      }

      assert.strictEqual(a.match(mock._class, []), undefined);
    });

    void it('should return undefined if no expected calls match', () => {
      const mock = new Mock('mock');
      const a = new AndNode(new ExpectedCall(new Mock('a')._class, [], true, true));
      const b = new AndNode(new ExpectedCall(mock._class, [0], true, true));

      a.merge(b);

      assert.strictEqual(a.match(mock, [1]), undefined);
    });

    void it('should return an expected call if the expected call matches', () => {
      const mock = new Mock('mock');
      const a = new AndNode(new ExpectedCall(mock._class, [], true, true));

      assert.notStrictEqual(a.match(mock._class, []), undefined);
    });
  });

  void describe('partialMatch', () => {
    void it('should return false if all the calls are completed', () => {
      const mock = new Mock('mock');
      const a = new AndNode(new ExpectedCall(mock._class, [], true, false));
      const b = new AndNode(new ExpectedCall(mock._class, [], true, false));

      a.merge(b);

      for(const expectedCall of a.expectedCalls) {
        expectedCall.execute([]);
      }

      assert.strictEqual(a.partialMatch(mock, []), false);
    });

    void it('should return false if no expected calls match', () => {
      const mock = new Mock('mock');
      const a = new AndNode(new ExpectedCall(new Mock('a')._class, [], true, true));
      const b = new AndNode(new ExpectedCall(new Mock('b')._class, [], true, true));

      a.merge(b);

      assert.strictEqual(a.partialMatch(mock, []), false);
    });

    void it('should return an expected call if the expected call matches', () => {
      const mock = new Mock('mock');
      const a = new AndNode(new ExpectedCall(mock._class, [], true, true));

      assert.strictEqual(a.partialMatch(mock._class, []), true);
    });
  });

  void describe('onlyOptionalRemain', () => {
    void it('should return true if all calls are complete', () => {
      const mock = new Mock('mock');
      const a = new AndNode(new ExpectedCall(mock._class, [], true, false));
      const b = new AndNode(new ExpectedCall(mock._class, [], true, false));

      a.merge(b);

      for(const expectedCall of a.expectedCalls) {
        expectedCall.execute([]);
      }

      assert.strictEqual(a.onlyOptionalRemain(), true);
    });

    void it('should return false if any incomplete calls are required', () => {
      const mock = new Mock('mock');
      const a = new AndNode(new ExpectedCall(mock._class, [], true, false));
      const b = new AndNode(new ExpectedCall(mock._class, [], true, false));

      a.merge(b);

      a.expectedCalls[0].execute([]);

      assert.strictEqual(a.onlyOptionalRemain(), false);
    });

    void it('should return true if all incomplete calls are optional', () => {
      const mock = new Mock('mock');
      const a = new AndNode(new ExpectedCall(mock._class, [], true, false));
      const b = new AndNode(new ExpectedCall(mock._class, [], false, false));

      a.merge(b);

      a.expectedCalls[0].execute([]);

      assert.strictEqual(a.onlyOptionalRemain(), true);
    });
  });

  void describe('toString()', () => {
    void it('should include expectedCalls', () => {
      const a = new AndNode({ name: 'a' });
      const b = new AndNode({ name: 'b' });

      assert.strictEqual(a.toString(), '{ AND {{ a }} }');

      a.merge(b);

      assert.strictEqual(a.toString(), '{ AND {{ a, b }} }');
    });

    void it('should include the child if it exists', () => {
      const a = new AndNode({ name: 'a' });
      const b = new AndNode({ name: 'b' });

      a.child = b;

      assert.strictEqual(a.toString(), '{ AND {{ a }} [{ AND {{ b }} }] }');
    });
  });
});
