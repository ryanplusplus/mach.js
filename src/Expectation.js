'use strict';

var ExpectedCall = require('./ExpectedCall.js');
var NotAllCallsOccurredError = require('./Error/NotAllCallsOccurredError.js');
var OutOfOrderCallError = require('./Error/OutOfOrderCallError.js');
var UnexpectedArgumentsError = require('./Error/UnexpectedArgumentsError.js');
var UnexpectedFunctionCallError = require('./Error/UnexpectedFunctionCallError.js');

Array.prototype.last = function() {
  return this[this.length - 1];
};

class Expectation {
  constructor(mock, required) {
    this._mock = mock;
    this._expectedCalls = [new ExpectedCall(mock, [], required, true)];
    this._callIndex = 0;
    this._ignoreOtherCalls = false;
  }

  withTheseArguments(args) {
    this._expectedCalls.last().expectedArgs = args;
    return this;
  }

  withAnyArguments() {
    this._expectedCalls.last().checkArgs = false;
    return this;
  }

  _chainExpectations(expectation) {
    for (let expectedCall of expectation._expectedCalls) {
      this._expectedCalls.push(expectedCall);
    }

    return this;
  }

  and(expectation) {
    return this._chainExpectations(expectation);
  }

  then(expectation) {
    expectation._expectedCalls[0].strictlyOrdered = true;

    return this._chainExpectations(expectation);
  }

  multipleTimes(count) {
    for (var i = 0; i < count - 1; i++) {
      this._expectedCalls.push(this._expectedCalls.last().clone());
    }

    return this;
  }

  andWillReturn(returnValue) {
    this._expectedCalls.last().returnValue = returnValue;
    return this;
  }

  andWillThrow(throwValue) {
    this._expectedCalls.last().throwValue = throwValue;
    return this;
  }

  andOtherCallsShouldBeIgnored() {
    this._ignoreOtherCalls = true;
    return this;
  }

  get _completedCalls() {
    return this._expectedCalls.filter(c => c.completed);
  }

  get _incompleteCalls() {
    return this._expectedCalls.filter(c => !c.completed);
  }

  _checkCalls() {
    for (let expectedCall of this._expectedCalls) {
      if (expectedCall.isRequired && !expectedCall.completed) {
        throw new NotAllCallsOccurredError(this._completedCalls, this._incompleteCalls);
      }
    }
  }

  _asyncWhen(thunk) {
    return new Promise((resolve) => {
        var done = () => resolve();

        return thunk(done);
      })
      .then(() => {
        this._checkCalls();
      }).catch((error) => {
        return error;
      }).then((error) => {
        this._mock._resetHandler();

        if (error) {
          throw error;
        }
      });
  }

  _syncWhen(thunk) {
    try {
      thunk();
    } finally {
      this._mock._resetHandler();
    }

    this._checkCalls();
  }

  when(thunk) {
    this._mock._handler = (args) => {
      var partialMatch;
      var incompleteExpectationFound = false;

      for (var i = this._callIndex; i < this._expectedCalls.length; i++) {
        var expectedCall = this._expectedCalls[i];
        if (!expectedCall.completed) {
          if (expectedCall.matches(this._mock, args)) {
            if (expectedCall.strictlyOrdered && incompleteExpectationFound) {
              throw new OutOfOrderCallError(this._mock, args, this._completedCalls, this._incompleteCalls);
            }

            if (expectedCall.strictlyOrdered) {
              this._callIndex = i;
            }

            expectedCall.complete(args);

            if (expectedCall.throwValue) {
              throw expectedCall.throwValue;
            }

            return expectedCall.returnValue;
          }

          if (expectedCall.matchesFunction(this._mock)) {
            partialMatch = expectedCall;
          }
        }

        if (partialMatch) {
          throw new UnexpectedArgumentsError(this._mock, args, this._completedCalls, this._incompleteCalls);
        }

        if (!this._ignoreOtherCalls) {
          throw new UnexpectedFunctionCallError(this._mock, args, this._completedCalls, this._incompleteCalls);
        }
      }
    };

    switch (thunk.length) {
      case 0:
        return this._syncWhen(thunk);
      default:
        return this._asyncWhen(thunk);
    }
  }
}

module.exports = Expectation;
