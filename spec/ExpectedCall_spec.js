'use strict';

describe('ExpectedCall', () => {
  let ExpectedCall = require('../src/ExpectedCall.js');
  let Any = require('../src/Any.js');
  let Callback = require('../src/Callback.js');
  let Same = require('../src/Same.js');

  it('should have the same name as its mock', () => {
    expect(new ExpectedCall({
      name: 'foo'
    }, [], false, false).name).toEqual('foo');
  });

  describe('execute', () => {
    let expectedCall;

    beforeEach(() => {
      expectedCall = new ExpectedCall({}, [], false, false);
    });

    it('should throw an error if a throwValue is defined', () => {
      expectedCall.throwValue = new Error('oh noes!');

      expect(() => expectedCall.execute()).toThrowError('oh noes!');
    });

    it('should invoke a callback if a callback is defined', (done) => {
      expectedCall.callbackIndex = 0;
      expectedCall.callbackArgs = [1];

      new Promise((resolve) => {
          expectedCall.execute([(value) => {
            resolve(value);
          }]);
        })
        .catch(fail)
        .then((value) => {
          expect(value).toEqual(1);
          done();
        });
    });

    it('should return a value if a returnValue is defined', () => {
      expectedCall.returnValue = 1;

      expect(expectedCall.execute()).toEqual(1);
    });

    it('should be marked as done when execute is called', () => {
      let expectedCall = new ExpectedCall({}, [], false, false);

      expect(expectedCall.completed).toBe(false);
      expect(expectedCall.actualArgs).toBeUndefined();

      let args = [0, 1, 2];

      expectedCall.execute(args);

      expect(expectedCall.completed).toBe(true);
      expect(expectedCall.actualArgs).toEqual(args);
    });
  });

  it('should be able to match against a mock', () => {
    let foo = {
      name: 'foo'
    };
    let bar = {
      name: 'bar'
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

    it('should check callbacks', () => {
      let expectedCall = new ExpectedCall({}, [new Callback()], false, true);

      expect(expectedCall.matchesArguments([0])).toBe(false);
      expect(expectedCall.matchesArguments([() => {}])).toBe(true);
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
        name: 'foo'
      }, [0], false, true);

      expect(expectedCall.matches({
        name: 'bar'
      }, [1])).toBe(false);
    });

    it('should return false if arguments do not match', () => {
      let mock = {
        name: 'mock'
      };
      let expectedCall = new ExpectedCall(mock, [0], false, true);

      expect(expectedCall.matches(mock, [1])).toBe(false);
    });

    it('should return false if mocks do not match', () => {
      let expectedCall = new ExpectedCall({
        name: 'foo'
      }, [0], false, true);

      expect(expectedCall.matches({
        name: 'bar'
      }, [0])).toBe(false);
    });

    it('should return true if mocks and arguments match', () => {
      let mock = {
        name: 'mock'
      };
      let expectedCall = new ExpectedCall(mock, [0], false, true);

      expect(expectedCall.matches(mock, [0])).toBe(true);
    });
  });
});
