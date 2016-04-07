'use strict';

var ArgumentsString = require('./ArgumentsString.js');
var FunctionCallsString = require('./FunctionCallsString.js');

/**
 * Error thrown when an {@link ExpectedCall} is called out of order.
 * @memberof Errors
 */
class OutOfOrderCallError extends Error {
  /**
   * Creates a new {@link OutOfOrderCallError}
   * @param {Mock} mock {@link Mock} that was called.
   * @param {object[]} args Arguments of the unexpected call.
   * @param {ExpectedCall[]} calls Expected calls.
   */
  constructor(mock, args, calls) {
    super('Out of order function call ' +
      mock.name +
      '(' + new ArgumentsString(args) + ')' +
      new FunctionCallsString(calls));
  }
}

module.exports = OutOfOrderCallError;
