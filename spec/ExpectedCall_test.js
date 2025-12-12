'use strict';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

void describe('ExpectedCall', () => {
  let ExpectedCall = require('../src/ExpectedCall.js');
  let Any = require('../src/Any.js');
  let Callback = require('../src/Callback.js');
  let Same = require('../src/Same.js');

  void it('should have the same name as its mock', () => {
    assert.strictEqual(new ExpectedCall({
      name: 'foo'
    }, [], false, false).name, 'foo');
  });

  void describe('execute', () => {
    let expectedCall;

    beforeEach(() => {
      expectedCall = new ExpectedCall({}, [], false, false);
    });

    void it('should throw an error if a throwValue is defined', () => {
      expectedCall.throwValue = new Error('oh noes!');

      assert.throws(() => expectedCall.execute(), /oh noes!/);
    });

    void it('should invoke a callback if a callback is defined', async () => {
      expectedCall.callbackIndex = 0;
      expectedCall.callbackArgs = [1];

      const value = await new Promise((resolve) => {
        expectedCall.execute([(value) => {
          resolve(value);
        }]);
      });

      assert.strictEqual(value, 1);
    });

    void it('should return a value if a returnValue is defined', () => {
      expectedCall.returnValue = 1;

      assert.strictEqual(expectedCall.execute(), 1);
    });

    void it('should be marked as done when execute is called', () => {
      let expectedCall = new ExpectedCall({}, [], false, false);

      assert.strictEqual(expectedCall.completed, false);
      assert.strictEqual(expectedCall.actualArgs, undefined);

      let args = [0, 1, 2];

      expectedCall.execute(args);

      assert.strictEqual(expectedCall.completed, true);
      assert.deepStrictEqual(expectedCall.actualArgs, args);
    });
  });

  void it('should be able to match against a mock', () => {
    let foo = {
      name: 'foo'
    };
    let bar = {
      name: 'bar'
    };

    let expectedCall = new ExpectedCall(foo, [], false, false);

    assert.strictEqual(expectedCall.matchesFunction(foo), true);
    assert.strictEqual(expectedCall.matchesFunction(bar), false);
  });

  void describe('matchesArguments', () => {
    void it('should always return true if checkArgs is false', () => {
      let a = [0, 1, 2];
      let b = [3, 4, 5];

      let expectedCall = new ExpectedCall({}, a, false, false);

      assert.strictEqual(expectedCall.matchesArguments(a), true);
      assert.strictEqual(expectedCall.matchesArguments(b), true);
    });

    void it('should return false when argument lengths don\'t match', () => {
      let expectedCall = new ExpectedCall({}, [], false, true);
      assert.strictEqual(expectedCall.matchesArguments([0]), false);
    });

    void it('should return true when Any is specified for an argument', () => {
      let expectedCall = new ExpectedCall({}, [new Any()], false, true);
      assert.strictEqual(expectedCall.matchesArguments([0]), true);
    });

    void it('should use Same.matcher to validate an argument', () => {
      let expectedCall = new ExpectedCall({}, [new Same(0)], false, true);

      assert.strictEqual(expectedCall.matchesArguments([0]), true);
      assert.strictEqual(expectedCall.matchesArguments([1]), false);
    });

    void it('should check callbacks', () => {
      let expectedCall = new ExpectedCall({}, [new Callback()], false, true);

      assert.strictEqual(expectedCall.matchesArguments([0]), false);
      assert.strictEqual(expectedCall.matchesArguments([() => {}]), true);
    });

    void it('should use basic equality to validate an argument', () => {
      let expectedCall = new ExpectedCall({}, [0], false, true);

      assert.strictEqual(expectedCall.matchesArguments([0]), true);
      assert.strictEqual(expectedCall.matchesArguments([1]), false);
    });
  });

  void describe('matches', () => {
    void it('should return false if neither mock nor arguments match', () => {
      let expectedCall = new ExpectedCall({
        name: 'foo'
      }, [0], false, true);

      assert.strictEqual(expectedCall.matches({
        name: 'bar'
      }, [1]), false);
    });

    void it('should return false if arguments do not match', () => {
      let mock = {
        name: 'mock'
      };
      let expectedCall = new ExpectedCall(mock, [0], false, true);

      assert.strictEqual(expectedCall.matches(mock, [1]), false);
    });

    void it('should return false if mocks do not match', () => {
      let expectedCall = new ExpectedCall({
        name: 'foo'
      }, [0], false, true);

      assert.strictEqual(expectedCall.matches({
        name: 'bar'
      }, [0]), false);
    });

    void it('should return true if mocks and arguments match', () => {
      let mock = {
        name: 'mock'
      };
      let expectedCall = new ExpectedCall(mock, [0], false, true);

      assert.strictEqual(expectedCall.matches(mock, [0]), true);
    });
  });
});
