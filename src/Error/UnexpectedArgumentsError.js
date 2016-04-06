'use strict';

var ArgumentsString = require('./ArgumentsString.js');
var FunctionCallsString = require('./FunctionCallsString.js');

class UnexpectedArgumentsError extends Error {
  constructor(mock, args, calls) {
    super('Unexpected arguments ' +
      '(' + new ArgumentsString(args) + ')' +
      ' provided to function ' +
      mock._name +
      new FunctionCallsString(calls));
  }
}

module.exports = UnexpectedArgumentsError;
