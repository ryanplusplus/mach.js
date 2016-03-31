'use strict';

describe('Expectation', () => {
  let Expectation = require('../src/Expectation.js');

  it('should initialize correctly', () => {
    let mock = {
      _name: 'mock'
    };
    let expectation = new Expectation(mock, true);

    expect(expectation._mock).toEqual(mock);
    expect(expectation._expectedCalls.length).toEqual(1);

    let expectedCall = expectation._expectedCalls[0];

    expect(expectedCall.mock).toEqual(mock);
    expect(expectedCall.expectedArgs).toEqual([]);
    expect(expectedCall.required).toBe(true);
    expect(expectedCall.checkArgs).toBe(true);

    expect(expectation._ignoreOtherCalls).toBe(false);

    expect(new Expectation(mock, false)._expectedCalls[0].required).toBe(false);
  });

  it('withTheseArguments should set the expected calls expected arguments', () => {
    let args = [0, 1, 2];
    let expectation = new Expectation({
      _name: 'mock'
    }, true).withTheseArguments(args);

    expect(expectation._expectedCalls[0].expectedArgs).toEqual(args);
  });

  it('withAnyArguments should set the expected calls checkArgs to false', () => {
    let expectation = new Expectation({
      _name: 'mock'
    }, true).withAnyArguments();

    expect(expectation._expectedCalls[0].checkArgs).toBe(false);
  });

  it('and should merge expectations expected calls', () => {
    let mock = {
      _name: 'foo'
    };
    let a = new Expectation(mock, true);
    let b = new Expectation({
      _name: 'bar'
    }, true);

    let c = a.and(b);

    expect(c._mock).toEqual(a._mock);
    expect(c._expectedCalls.length).toEqual(2);
  });

  it('then should merge expectation and require strict ordering', () => {
    let mock = {
      _name: 'foo'
    };
    let a = new Expectation(mock, true);
    let b = new Expectation({
      _name: 'bar'
    }, true);

    let c = a.then(b);

    expect(c._mock).toEqual(a._mock);
    expect(c._expectedCalls.length).toEqual(2);
    expect(b._expectedCalls[0].strictlyOrdered).toBe(true);
    expect(c._expectedCalls[1].strictlyOrdered).toBe(true);
  });

  it('multipleTimes should repeat the last expected call the specified number of times', () => {
    let mock = {
      _name: 'mock'
    };

    expect(new Expectation(mock, true).multipleTimes(1)._expectedCalls.length).toEqual(1);

    expect(new Expectation(mock, true).multipleTimes(3)._expectedCalls.length).toEqual(3);
  });

  it('andWillReturn should set the return value', () => {
    let mock = {
      _name: 'mock'
    };

    let returnValue = 0;

    let expectation = new Expectation(mock, true).andWillReturn(returnValue);

    expect(expectation._expectedCalls[0].returnValue).toEqual(returnValue);
  });

  it('andWillThrow should set the throw value', () => {
    let mock = {
      _name: 'mock'
    };

    let throwValue = new Error('oh noes...');

    let expectation = new Expectation(mock, true).andWillThrow(throwValue);

    expect(expectation._expectedCalls[0].throwValue).toEqual(throwValue);
  });

  it('andOtherCallsShouldBeIgnored should toggle the property', () => {
    let mock = {
      _name: 'mock'
    };

    let expectation = new Expectation(mock, true).andOtherCallsShouldBeIgnored();

    expect(expectation._ignoreOtherCalls).toBe(true);
  });
});
