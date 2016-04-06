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

  withTheseArguments() {
    this._expectedCall.expectedArgs = Array.from(arguments);

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
    console.log(this._tree.toString());
    console.log(expectation._tree.toString());
    console.log('---');

    this._tree.and(expectation._tree);

    console.log(this._tree.toString());

    console.log('===');

    expectation._tree = this._tree;

    return this;
  }

  andAlso(expectation) {
    return this.and(expectation);
  }

  then(expectation) {
    console.log(this._tree.toString());
    console.log(expectation._tree.toString());
    console.log('---');

    this._tree.then(expectation._tree);

    console.log(this._tree.toString());

    console.log('===');

    expectation._tree = this._tree;

    return this;
  }

  andThen(expectation) {
    return this.then(expectation);
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

  after(thunk) {
    return this.when(thunk);
  }
}

module.exports = Expectation;
