'use strict';

describe('Expectation', () => {
  let Expectation = require('../src/Expectation.js');

  it('should initialize with an ExpectedCall and Tree', () => {
    let expectation = new Expectation({
      _name: 'foo'
    }, true);

    expect(expectation._expectedCall.name).toEqual('foo');
    expect(expectation._tree._root.child.name).toEqual('foo');
  });

  it('should set expected call required flag as specified', () => {
    expect(new Expectation({
      _name: 'foo'
    }, true)._expectedCall.required).toEqual(true);

    expect(new Expectation({
      _name: 'foo'
    }, false)._expectedCall.required).toEqual(false);
  });

  it('withTheseArguments should set expected call arguments', () => {
    let args = [0, 1, 2, 3];

    let expectation = new Expectation({
      _name: 'foo'
    });

    expect(expectation._expectedCall.expectedArgs.length).toEqual(0);

    expectation.withTheseArguments(args);

    expect(expectation._expectedCall.expectedArgs).toEqual(args);
  });

  it('withAnyArguments should set expected call checkArgs to false', () => {
    let expectation = new Expectation({
      _name: 'foo'
    });

    expect(expectation._expectedCall.checkArgs).toBe(true);

    expectation.withAnyArguments();

    expect(expectation._expectedCall.checkArgs).toEqual(false);
  });

  it('andWillReturn should set expected call return value', () => {
    let expectation = new Expectation({
      _name: 'foo'
    });

    expect(expectation._expectedCall.returnValue).toBeUndefined();

    expectation.andWillReturn(0);

    expect(expectation._expectedCall.returnValue).toEqual(0);
  });

  it('andWillThrow should set expected call throw value', () => {
    let expectation = new Expectation({
      _name: 'foo'
    });

    let error = new Error('oh noes');

    expect(expectation._expectedCall.throwValue).toBeUndefined();

    expectation.andWillThrow(error);

    expect(expectation._expectedCall.throwValue).toEqual(error);
  });

  it('and should merge the expectations trees', () => {
    let a = new Expectation({
      _name: 'a'
    }, true);

    let b = new Expectation({
      _name: 'b'
    }, true);

    a.and(b);

    let expectedTree = '{ ROOT [{ AND {{ a, b }} [{ TERMINUS }] }] }';
    expect(a._tree.toString()).toEqual(expectedTree);
    expect(b._tree.toString()).toEqual(expectedTree);
  });

  it('then should merge the expectations tree', () => {
    let a = new Expectation({
      _name: 'a'
    }, true);

    let b = new Expectation({
      _name: 'b'
    }, true);

    a.then(b);

    let expectedTree = '{ ROOT [{ a [{ b [{ TERMINUS }] }] }] }';
    expect(a._tree.toString()).toEqual(expectedTree);
    expect(b._tree.toString()).toEqual(expectedTree);
  });

  it('multipleTimes should chain same expectation multiple times', () => {
    let a = new Expectation({
      _name: 'a'
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
});
