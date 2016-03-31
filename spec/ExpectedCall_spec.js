'use strict';

describe('ExpectedCall', () => {
  let ExpectedCall = require('../src/ExpectedCall.js');
  let Any = require('../src/Any.js');
  let Same = require('../src/Same.js');

  it('should have the same name as its mock', () => {
    expect(new ExpectedCall({
      _name: 'foo'
    }, [], false, false).name).toEqual('foo');
  });

  it('should be marked as done when complete is called', () => {
    let expectedCall = new ExpectedCall({}, [], false, false);

    expect(expectedCall.completed).toBe(false);
    expect(expectedCall.actualArgs).toBeUndefined();

    let args = [0, 1, 2];

    expectedCall.complete(args);

    expect(expectedCall.completed).toBe(true);
    expect(expectedCall.actualArgs).toEqual(args);
  });

  it('should be able to match against a mock', () => {
    let foo = {
      _name: 'foo'
    };
    let bar = {
      _name: 'bar'
    };

    let expectedCall = new ExpectedCall(foo, [], false, false);

    expect(expectedCall.matchesFunction(foo)).toBe(true);
    expect(expectedCall.matchesFunction(bar)).toBe(false);
  });

  describe('matchesArguments', () => {
    it('should always return true if checkArgs is false', () => {
      let a = [0, 1, 2];
      let b = [3, 4, 5];

      let expectedCall = new ExpectedCall({}, a, false, false);

      expect(expectedCall.matchesArguments(a)).toBe(true);
      expect(expectedCall.matchesArguments(b)).toBe(true);
    });

    it('should return false when argument lengths don\'t match', () => {
      let expectedCall = new ExpectedCall({}, [], false, true);
      expect(expectedCall.matchesArguments([0])).toBe(false);
    });

    it('should return true when Any is specified for an argument', () => {
      let expectedCall = new ExpectedCall({}, [new Any()], false, true);
      expect(expectedCall.matchesArguments([0])).toBe(true);
    });

    it('should use Same.matcher to validate an argument', () => {
      let expectedCall = new ExpectedCall({}, [new Same(0)], false, true);

      expect(expectedCall.matchesArguments([0])).toBe(true);
      expect(expectedCall.matchesArguments([1])).toBe(false);
    });

    it('should use basic equality to validate an argument', () => {
      let expectedCall = new ExpectedCall({}, [0], false, true);

      expect(expectedCall.matchesArguments([0])).toBe(true);
      expect(expectedCall.matchesArguments([1])).toBe(false);
    });
  });

  describe('matches', () => {
    it('should return false if neither mock nor arguments match', () => {
      let expectedCall = new ExpectedCall({
        _name: 'foo'
      }, [0], false, true);

      expect(expectedCall.matches({
        _name: 'bar'
      }, [1])).toBe(false);
    });

    it('should return false if arguments do not match', () => {
      let mock = {
        _name: 'mock'
      };
      let expectedCall = new ExpectedCall(mock, [0], false, true);

      expect(expectedCall.matches(mock, [1])).toBe(false);
    });

    it('should return false if mocks do not match', () => {
      let expectedCall = new ExpectedCall({
        _name: 'foo'
      }, [0], false, true);

      expect(expectedCall.matches({
        _name: 'bar'
      }, [0])).toBe(false);
    });

    it('should return true if mocks and arguments match', () => {
      let mock = {
        _name: 'mock'
      };
      let expectedCall = new ExpectedCall(mock, [0], false, true);

      expect(expectedCall.matches(mock, [0])).toBe(true);
    });
  });

  it('clone should make a copy', () => {
    let mock = {
      _name: 'mock'
    };
    let args = [0, 1, 2];
    let required = true;
    let checkArgs = true;
    let original = new ExpectedCall(mock, args, required, checkArgs);
    original.returnValue = 3;

    let copy = original.clone();

    expect(original.mock).toEqual(copy.mock);
    expect(original.expectedArgs).toEqual(copy.expectedArgs);
    expect(original.required).toEqual(copy.required);
    expect(original.checkArgs).toEqual(copy.checkArgs);
    expect(original.returnValue).toEqual(copy.returnValue);

    original.returnValue = 0;

    expect(original.returnValue).not.toEqual(copy.returnValue);
  });
});
