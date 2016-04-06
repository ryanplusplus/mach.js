'use strict';

var ExpectedCall = require('./ExpectedCall.js');
var Tree = require('./Tree/Tree.js');
var ExpectedCallNode = require('./Tree/ExpectedCallNode.js');

class Expectation {
  constructor(mock, required) {
    this._mock = mock;
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
    this._tree.ignoreOtherCalls();

    return this;
  }

  when(thunk) {
    return this._tree.execute(thunk);
  }
}

module.exports = Expectation;
