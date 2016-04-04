'use strict';

var ExpectedCall = require('./ExpectedCall.js');
var Tree = require('./Tree/Tree.js');
var ExpectedCallNode = require('./Tree/ExpectedCallNode.js');
// var NotAllCallsOccurredError = require('./Error/NotAllCallsOccurredError.js');
// var OutOfOrderCallError = require('./Error/OutOfOrderCallError.js');
// var UnexpectedArgumentsError = require('./Error/UnexpectedArgumentsError.js');
// var UnexpectedFunctionCallError = require('./Error/UnexpectedFunctionCallError.js');

class Expectation {
  constructor(mock, required) {
    this._mock = mock;
    this._ignoreOtherCalls = false;
    this._expectedCall = new ExpectedCall(mock, [], required, true);
    this._tree = new Tree(new ExpectedCallNode(this._expectedCall));
  }

  withTheseArguments(args) {
    this._expectedCall.expectedArgs = args;

    return this;
  }

  withAnyArguments() {
    this._expectedCall.checkArgs = false;

    return this;
  }

  andWillReturn(returnValue) {
    this._expectedCall.returnValue = returnValue;

    return this;
  }

  andWillThrow(throwValue) {
    this._expectedCall.throwValue = throwValue;

    return this;
  }

  and(expectation) {
    this._tree.and(expectation._tree);

    expectation._tree = this._tree;

    return this;
  }

  then(expectation) {
    this._tree.then(expectation._tree);

    expectation._tree = this._tree;

    return this;
  }

  multipleTimes(count) {
    for (var i = 0; i < count - 1; i++) {
      let expectation = new Expectation(this._mock, this._expectedCall.required);

      expectation._expectedCall.expectedArgs = this._expectedCall.expectedArgs;
      expectation._expectedCall.checkArgs = this._expectedCall.checkArgs;
      expectation._expectedCall.returnValue = this._expectedCall.returnValue;

      this.and(expectation);
    }

    return this;
  }

  andOtherCallsShouldBeIgnored() {
    // TODO: how implement in when?
    this._ignoreOtherCalls = true;

    return this;
  }

  get _completedCalls() {
    return this._tree.completedCalls;
  }

  get _incompleteCalls() {
    return this._tree.incompleteCalls;
  }

  _checkCalls() {
    // TODO: implement
    // for (let expectedCall of this._expectedCalls) {
    //   if (expectedCall.required && !expectedCall.completed) {
    //     throw new NotAllCallsOccurredError(this._completedCalls, this._incompleteCalls);
    //   }
    // }
  }

  _asyncWhen(thunk) {
    return new Promise((resolve) => {
        var done = () => resolve();

        return thunk(done);
      })
      .then(() => {
        this._checkCalls();
      })
      .catch((error) => {
        return error;
      })
      .then((error) => {
        // TODO: reset for whole chain
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
      // TODO: reset for whole chain
      this._mock._resetHandler();
    }

    this._checkCalls();
  }

  when(thunk) {
    // TODO: set for whole chain
    //- need to ensure each mock gets its expectations references and not just all the same one?
    // this._mock._handler = (args) => {
    // TODO: Implement
    // var partialMatch;
    // var incompleteExpectationFound = false;
    //
    // for (var i = this._callIndex; i < this._expectedCalls.length; i++) {
    //   var expectedCall = this._expectedCalls[i];
    //   if (!expectedCall.completed) {
    //     if (expectedCall.matches(this._mock, args)) {
    //       if (expectedCall.strictlyOrdered && incompleteExpectationFound) {
    //         throw new OutOfOrderCallError(this._mock, args, this._completedCalls, this._incompleteCalls);
    //       }
    //
    //       if (expectedCall.strictlyOrdered) {
    //         this._callIndex = i;
    //       }
    //
    //       expectedCall.complete(args);
    //
    //       if (expectedCall.throwValue) {
    //         throw expectedCall.throwValue;
    //       }
    //
    //       return expectedCall.returnValue;
    //     }
    //
    //     if (expectedCall.matchesFunction(this._mock)) {
    //       partialMatch = expectedCall;
    //     }
    //   }
    //
    //   if (partialMatch) {
    //     throw new UnexpectedArgumentsError(this._mock, args, this._completedCalls, this._incompleteCalls);
    //   }
    //
    //   if (!this._ignoreOtherCalls) {
    //     throw new UnexpectedFunctionCallError(this._mock, args, this._completedCalls, this._incompleteCalls);
    //   }
    // }
    // };

    switch (thunk.length) {
      case 0:
        return this._syncWhen(thunk);
      default:
        return this._asyncWhen(thunk);
    }
  }
}

module.exports = Expectation;
