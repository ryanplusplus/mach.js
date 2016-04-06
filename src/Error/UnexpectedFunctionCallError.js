'use strict';

var ArgumentsString = require('./ArgumentsString.js');
var FunctionCallsString = require('./FunctionCallsString.js');

class UnexpectedFunctionCallError extends Error {
  constructor(mock, args, calls) {
    super('Unexpected function call ' +
      mock._name +
      '(' + new ArgumentsString(args) + ')' +
      new FunctionCallsString(calls));
  }
}

module.exports = UnexpectedFunctionCallError;
