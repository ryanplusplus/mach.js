'use strict';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

void describe('Expectation', () => {
  let Expectation = require('../src/Expectation.js');
  let Mock = require('../src/Mock.js');
  let Callback = require('../src/Callback.js');

  void it('should initialize with an ExpectedCall and Tree', () => {
    let expectation = new Expectation({
      name: 'foo'
    }, true);

    assert.strictEqual(expectation._expectedCall.name, 'foo');
    assert.strictEqual(expectation._tree._root.child.name, 'foo');
  });

  void it('should set expected call required flag as specified', () => {
    assert.strictEqual(new Expectation({
      name: 'foo'
    }, true)._expectedCall.required, true);

    assert.strictEqual(new Expectation({
      name: 'foo'
    }, false)._expectedCall.required, false);
  });

  void it('withTheseArguments should set expected call arguments', () => {
    let args = [0, 1, 2, 3];

    let expectation = new Expectation({
      name: 'foo'
    });

    assert.strictEqual(expectation._expectedCall.expectedArgs.length, 0);

    expectation.withTheseArguments(0, 1, 2, 3);

    assert.strictEqual(expectation._expectedCall.expectedArgs.length, args.length);

    for(let i = 0; i < args.length; i++) {
      assert.strictEqual(expectation._expectedCall.expectedArgs[i], args[i]);
    }
  });

  void it('withAnyArguments should set expected call checkArgs to false', () => {
    let expectation = new Expectation({
      name: 'foo'
    });

    assert.strictEqual(expectation._expectedCall.checkArgs, true);

    expectation.withAnyArguments();

    assert.strictEqual(expectation._expectedCall.checkArgs, false);
  });

  void it('andWillReturn should set expected call return value', () => {
    let expectation = new Expectation({
      name: 'foo'
    });

    assert.strictEqual(expectation._expectedCall.returnValue, undefined);

    expectation.andWillReturn(0);

    assert.strictEqual(expectation._expectedCall.returnValue, 0);
  });

  void it('withResult should be an alias for andWillReturn', () => {
    let expectation = new Expectation({
      name: 'foo'
    });

    assert.strictEqual(expectation.withResult, expectation.andWillReturn);
  });

  void it('andWillThrow should set expected call throw value', () => {
    let expectation = new Expectation({
      name: 'foo'
    });

    let error = new Error('oh noes');

    assert.strictEqual(expectation._expectedCall.throwValue, undefined);

    expectation.andWillThrow(error);

    assert.strictEqual(expectation._expectedCall.throwValue, error);
  });

  void it('and should merge the expectations trees', () => {
    let a = new Expectation({
      name: 'a'
    }, true);

    let b = new Expectation({
      name: 'b'
    }, true);

    a.and(b);

    let expectedTree = '{ ROOT [{ AND {{ a, b }} [{ TERMINUS }] }] }';
    assert.strictEqual(a._tree.toString(), expectedTree);
    assert.strictEqual(b._tree.toString(), expectedTree);
  });

  void it('then should merge the expectations tree', () => {
    let a = new Expectation({
      name: 'a'
    }, true);

    let b = new Expectation({
      name: 'b'
    }, true);

    a.then(b);

    let expectedTree = '{ ROOT [{ a [{ b [{ TERMINUS }] }] }] }';
    assert.strictEqual(a._tree.toString(), expectedTree);
    assert.strictEqual(b._tree.toString(), expectedTree);
  });

  void it('multipleTimes should chain same expectation multiple times', () => {
    let a = new Expectation({
      name: 'a'
    });

    a.multipleTimes(-1);
    assert.strictEqual(a._tree.toString(), '{ ROOT [{ a [{ TERMINUS }] }] }');

    a.multipleTimes(0);
    assert.strictEqual(a._tree.toString(), '{ ROOT [{ a [{ TERMINUS }] }] }');

    a.multipleTimes(1);
    assert.strictEqual(a._tree.toString(), '{ ROOT [{ a [{ TERMINUS }] }] }');

    a.multipleTimes(2);
    assert.strictEqual(a._tree.toString(), '{ ROOT [{ AND {{ a, a }} [{ TERMINUS }] }] }');

    a.multipleTimes(3);
    assert.strictEqual(a._tree.toString(), '{ ROOT [{ AND {{ a, a, a, a }} [{ TERMINUS }] }] }');
  });

  void it('andOtherCallsShouldBeIgnored should set tree property', () => {
    let expectation = new Expectation(new Mock('mock')._class, true);

    assert.strictEqual(expectation._tree._ignoreOtherCalls, false);

    expectation.andOtherCallsShouldBeIgnored();

    assert.strictEqual(expectation._tree._ignoreOtherCalls, true);
  });

  void it('withOtherCallsIgnored should set tree property', () => {
    let expectation = new Expectation(new Mock('mock')._class, true);

    assert.strictEqual(expectation._tree._ignoreOtherCalls, false);

    expectation.withOtherCallsIgnored();

    assert.strictEqual(expectation._tree._ignoreOtherCalls, true);
  });

  void it('when should execute the expectation chain', () => {
    let a = new Mock('a');
    let b = new Mock('b');
    let c = new Mock('c');

    a.shouldBeCalled().and(b.shouldBeCalled()).then(c.shouldBeCalled())
      .when(() => {
        b();
        a();
        c();
      });
  });

  void describe('andWillCallback', () => {
    let expectation;

    beforeEach(() => {
      expectation = new Expectation({
        name: 'foo'
      });
    });

    void it('should throw an error if no arguments were defined', () => {
      assert.throws(() => expectation.andWillCallback(),
        /expectation has no arguments to callback/);
    });

    void it('should throw an error if no callback argument was defined', () => {
      expectation.withTheseArguments(0);

      assert.throws(() => expectation.andWillCallback(),
        /expectation has no callback argument/);
    });

    void it('should set callback value', () => {
      assert.strictEqual(expectation._expectedCall.callbackIndex, -1);
      assert.strictEqual(expectation._expectedCall.callbackArgs.length, 0);

      expectation.withTheseArguments(new Callback());

      expectation.andWillCallback();

      assert.strictEqual(expectation._expectedCall.callbackIndex, 0);
      assert.strictEqual(expectation._expectedCall.callbackArgs.length, 0);
    });

    void it('should set callback value with arguments', () => {
      assert.strictEqual(expectation._expectedCall.callbackIndex, -1);
      assert.strictEqual(expectation._expectedCall.callbackArgs.length, 0);

      expectation.withTheseArguments(new Callback());

      expectation.andWillCallback(0);

      assert.strictEqual(expectation._expectedCall.callbackIndex, 0);
      assert.deepStrictEqual(expectation._expectedCall.callbackArgs, [0]);
    });
  });
});
