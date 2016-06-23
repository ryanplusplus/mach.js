'use strict';

describe('Expectation', () => {
  let Expectation = require('../src/Expectation.js');
  let Mock = require('../src/Mock.js');
  let Callback = require('../src/Callback.js');

  it('should initialize with an ExpectedCall and Tree', () => {
    let expectation = new Expectation({
      name: 'foo'
    }, true);

    expect(expectation._expectedCall.name).toEqual('foo');
    expect(expectation._tree._root.child.name).toEqual('foo');
  });

  it('should set expected call required flag as specified', () => {
    expect(new Expectation({
      name: 'foo'
    }, true)._expectedCall.required).toEqual(true);

    expect(new Expectation({
      name: 'foo'
    }, false)._expectedCall.required).toEqual(false);
  });

  it('withTheseArguments should set expected call arguments', () => {
    let args = [0, 1, 2, 3];

    let expectation = new Expectation({
      name: 'foo'
    });

    expect(expectation._expectedCall.expectedArgs.length).toEqual(0);

    expectation.withTheseArguments(0, 1, 2, 3);

    expect(expectation._expectedCall.expectedArgs.length).toEqual(args.length);

    for(let i = 0; i < args.length; i++) {
      expect(expectation._expectedCall.expectedArgs[i]).toEqual(args[i]);
    }
  });

  it('withAnyArguments should set expected call checkArgs to false', () => {
    let expectation = new Expectation({
      name: 'foo'
    });

    expect(expectation._expectedCall.checkArgs).toBe(true);

    expectation.withAnyArguments();

    expect(expectation._expectedCall.checkArgs).toEqual(false);
  });

  it('andWillReturn should set expected call return value', () => {
    let expectation = new Expectation({
      name: 'foo'
    });

    expect(expectation._expectedCall.returnValue).toBeUndefined();

    expectation.andWillReturn(0);

    expect(expectation._expectedCall.returnValue).toEqual(0);
  });

  it('andWillThrow should set expected call throw value', () => {
    let expectation = new Expectation({
      name: 'foo'
    });

    let error = new Error('oh noes');

    expect(expectation._expectedCall.throwValue).toBeUndefined();

    expectation.andWillThrow(error);

    expect(expectation._expectedCall.throwValue).toEqual(error);
  });

  it('and should merge the expectations trees', () => {
    let a = new Expectation({
      name: 'a'
    }, true);

    let b = new Expectation({
      name: 'b'
    }, true);

    a.and(b);

    let expectedTree = '{ ROOT [{ AND {{ a, b }} [{ TERMINUS }] }] }';
    expect(a._tree.toString()).toEqual(expectedTree);
    expect(b._tree.toString()).toEqual(expectedTree);
  });

  it('then should merge the expectations tree', () => {
    let a = new Expectation({
      name: 'a'
    }, true);

    let b = new Expectation({
      name: 'b'
    }, true);

    a.then(b);

    let expectedTree = '{ ROOT [{ a [{ b [{ TERMINUS }] }] }] }';
    expect(a._tree.toString()).toEqual(expectedTree);
    expect(b._tree.toString()).toEqual(expectedTree);
  });

  it('multipleTimes should chain same expectation multiple times', () => {
    let a = new Expectation({
      name: 'a'
    });

    a.multipleTimes(-1);
    expect(a._tree.toString()).toEqual('{ ROOT [{ a [{ TERMINUS }] }] }');

    a.multipleTimes(0);
    expect(a._tree.toString()).toEqual('{ ROOT [{ a [{ TERMINUS }] }] }');

    a.multipleTimes(1);
    expect(a._tree.toString()).toEqual('{ ROOT [{ a [{ TERMINUS }] }] }');

    a.multipleTimes(2);
    expect(a._tree.toString()).toEqual('{ ROOT [{ AND {{ a, a }} [{ TERMINUS }] }] }');

    a.multipleTimes(3);
    expect(a._tree.toString()).toEqual('{ ROOT [{ AND {{ a, a, a, a }} [{ TERMINUS }] }] }');
  });

  it('andOtherCallsShouldBeIgnored should set tree property', () => {
    let expectation = new Expectation(new Mock('mock')._class, true);

    expect(expectation._tree._ignoreOtherCalls).toBe(false);

    expectation.andOtherCallsShouldBeIgnored();

    expect(expectation._tree._ignoreOtherCalls).toBe(true);
  });

  it('when should execute the expecation chain', () => {
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

  describe('andWillCallback', () => {
    let expectation;

    beforeEach(() => {
      expectation = new Expectation({
        name: 'foo'
      });
    });

    it('should throw an error if no arguments were defined', () => {
      expect(() => expectation.andWillCallback())
        .toThrowError('expectation has no arguments to callback');
    });

    it('should throw an error if no callback argument was defined', () => {
      expectation.withTheseArguments(0);

      expect(() => expectation.andWillCallback())
        .toThrowError('expectation has no callback argument');
    });

    it('should throw an error if a return value is defined', () => {
      expectation.andWillReturn(0);

      expect(() => expectation.andWillCallback())
        .toThrowError('expectation can not have return value and callback');
    });

    it('andWillReturn should throw and error if a callback is defined', () => {
      expectation.withTheseArguments(new Callback());

      expectation.andWillCallback();

      expect(() => expectation.andWillReturn())
        .toThrowError('expectation can not have return value and callback');
    });

    it('should set callback value', () => {
      expect(expectation._expectedCall.callback).toBeUndefined();
      expect(expectation._expectedCall.callbackArgs.length).toEqual(0);

      expectation.withTheseArguments(new Callback());

      expectation.andWillCallback();

      expect(expectation._expectedCall.callback).toBeDefined();
      expect(expectation._expectedCall.callbackArgs.length).toEqual(0);

    });

    it('should set callback value with arguments', () => {
      expect(expectation._expectedCall.callback).toBeUndefined();
      expect(expectation._expectedCall.callbackArgs.length).toEqual(0);

      expectation.withTheseArguments(new Callback());

      expectation.andWillCallback(0);

      expect(expectation._expectedCall.callback).toBeDefined();
      expect(expectation._expectedCall.callbackArgs).toEqual([0]);
    });
  });
});
