'use strict';

var ArgumentsString = require('./ArgumentsString.js');
var FunctionCallsString = require('./FunctionCallsString.js');

/**
 * Error thrown when an {@link Mock} is called with different
 * arguments than specified in it's {@link ExpectedCall}.
 */
class UnexpectedArgumentsError extends Error {
  /**
   * Creates a new {@link UnexpectedArgumentsError}
   * @param {Mock} mock {@link Mock} that was called.
   * @param {object[]} args Arguments of the unexpected call.
   * @param {ExpectedCall[]} calls Expected calls.
   */
  constructor(mock, args, calls) {
    super('Unexpected arguments ' +
      '(' + new ArgumentsString(args) + ')' +
      ' provided to function ' +
      mock._name +
      new FunctionCallsString(calls));
  }
}

module.exports = UnexpectedArgumentsError;
