'use strict';

var ArgumentsString = require('./ArgumentsString.js');
var FunctionCallsString = require('./FunctionCallsString.js');

/**
 * Error thrown when an {@link ExpectedCall} is called and no incomplete expectation matches it.
 * @memberof Errors
 */
class UnexpectedFunctionCallError extends Error {
  /**
   * Creates a new {@link OutOfOrderCallError}
   * @param {Mock} mock {@link Mock} that was called.
   * @param {object[]} args Arguments of the unexpected call.
   * @param {ExpectedCall[]} calls Expected calls.
   */
  constructor(mock, args, calls) {
    super('Unexpected function call ' +
      mock.name +
      '(' + new ArgumentsString(args) + ')' +
      new FunctionCallsString(calls));
  }
}

module.exports = UnexpectedFunctionCallError;
