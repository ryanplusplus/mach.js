'use strict';

var FunctionCallsString = require('./FunctionCallsString.js');

/**
 * Error thrown when not all required {@link ExpectedCall}s were called.
 * @memberof Errors
 */
class NotAllCallsOccurredError extends Error {
  /**
   * Creates a new {@link NotAllCallsOccurredError}.
   * @param {ExpectedCall[]} calls Expected calls.
   */
  constructor(calls) {
    super('Not all calls occurred' +
      new FunctionCallsString(calls));
  }
}

module.exports = NotAllCallsOccurredError;
