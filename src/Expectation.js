'use strict';

var ExpectedCall = require('./ExpectedCall.js');
var Tree = require('./Tree/Tree.js');
var ExpectedCallNode = require('./Tree/ExpectedCallNode.js');

/**
 * This is a transitional object that helps convert {@link Mock}s into 
 * {@link ExpectedCall}s and build the resulting execution {@link Tree.Tree}.
 */
class Expectation {
  /**
   * Creates a new {@link Expectation}
   * @param {Mock} mock Mock that is being expected.
   * @param {boolean} required If true then mock is required to be called; otherwise it is optional and may be skipped during execution.
   */
  constructor(mock, required) {
    this._mock = mock;
    this._expectedCall = new ExpectedCall(mock, [], required, true);
    this._tree = new Tree(new ExpectedCallNode(this._expectedCall));
  }

  /**
   * Updates this expectatations {@link ExpectedCall} to have the specified arguments when it is called.
   * @param {object[]} arguments Required arguments for the {@link Mock}s call.
   * @returns {Expectation} This expectation, which allows chaining.
   */
  withTheseArguments() {
    this._expectedCall.expectedArgs = Array.from(arguments);

    return this;
  }

  /**
   * Updates this expectatations {@link ExpectedCall} to allow any arguments when it is called.
   * @returns {Expectation} This expectation, which allows chaining.
   */
  withAnyArguments() {
    this._expectedCall.checkArgs = false;

    return this;
  }

  /**
   * Updates this expectatations {@link ExpectedCall} to return the specified value.
   * @param {object} returnValue Value that will be returned when the expected call is executed.
   * @returns {Expectation} This expectation, which allows chaining.
   */
  andWillReturn(returnValue) {
    this._expectedCall.returnValue = returnValue;

    return this;
  }

  /**
   * Updates this expectatations {@link ExpectedCall} to throw the specified error.
   * @param {Error} error Error that will be thrown when the expected call is executed.
   * @returns {Expectation} This expectation, which allows chaining.
   */
  andWillThrow(error) {
    this._expectedCall.throwValue = error;

    return this;
  }

  /**
   * Combines this expecation with the specifed expectation using `AND`.
   * @param {Expectation} expectation Expectation to combine with this expecatation.
   * @returns {Expectation} This expectation, which allows chaining.
   */
  and(expectation) {
    this._tree.and(expectation._tree);

    expectation._tree = this._tree;

    return this;
  }

  andAlso(expectation) {
    return this.and(expectation);
  }

  then(expectation) {
    this._tree.then(expectation._tree);

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
